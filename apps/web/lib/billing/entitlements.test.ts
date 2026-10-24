// ─────────────────────────────────────────────────────────────
// Tests for the server-side plan guards (restrictions.md §3, §8).
// Every restricted API route funnels through these helpers, so
// proving them here proves the enforcement layer.
// Run: npm run test --workspace=apps/web
// ─────────────────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import {
  loadEntitlements,
  guardFeature,
  guardLimit,
  guardWorkflowCap,
  guardOverCap,
  historyCutoff,
  planLimitResponse,
} from "./entitlements";

// A tiny fake Supabase client covering exactly what the guards call:
//   from("flowlens_teams")...single()  → the team's plan row
//   from("flowlens_workflows")...      → { count }
function mockDb(opts: {
  plan?: string;
  plan_status?: string;
  trial_ends_at?: string | null;
  workflowCount: number;
}) {
  return {
    from(table: string) {
      const isTeams = table === "flowlens_teams";
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        gte: () => chain,
        single: () =>
          Promise.resolve(
            isTeams
              ? {
                  data: {
                    plan: opts.plan ?? "free",
                    plan_status: opts.plan_status ?? "active",
                    trial_ends_at: opts.trial_ends_at ?? null,
                  },
                  error: null,
                }
              : { data: null, error: { message: "unexpected single()" } }
          ),
        then: (resolve: any) =>
          resolve(isTeams ? { data: null, error: null } : { count: opts.workflowCount }),
      };
      return chain;
    },
  };
}

describe("loadEntitlements", () => {
  it("reads the team's plan", async () => {
    const ent = await loadEntitlements(mockDb({ plan: "pro", workflowCount: 0 }), "t1");
    expect(ent.effectivePlan).toBe("pro");
    expect(ent.maxWorkflows).toBe(10);
  });

  it("fails CLOSED (treats as free) when the row can't be read", async () => {
    const db = {
      from: () => ({
        select: function () { return this; },
        eq: function () { return this; },
        single: () => Promise.resolve({ data: null, error: { message: "no row" } }),
      }),
    };
    const ent = await loadEntitlements(db as any, "missing");
    expect(ent.effectivePlan).toBe("free");
    expect(ent.maxWorkflows).toBe(1);
  });
});

describe("guardFeature (direct connect, BYOK, ACL)", () => {
  it("blocks free", async () => {
    const res = await guardFeature(mockDb({ plan: "free", workflowCount: 0 }), "t1", "direct_connect");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
    const body = await res!.json();
    expect(body).toEqual({
      code: "PLAN_LIMIT",
      feature: "direct_connect",
      limit: null,
      currentPlan: "free",
      requiredPlan: "team",
    });
  });

  it("blocks pro (restrictions.md: direct connect = Team/Self-hosted only)", async () => {
    const res = await guardFeature(mockDb({ plan: "pro", workflowCount: 0 }), "t1", "direct_connect");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("allows team and self_hosted", async () => {
    expect(await guardFeature(mockDb({ plan: "team", workflowCount: 0 }), "t1", "direct_connect")).toBeNull();
    expect(await guardFeature(mockDb({ plan: "self_hosted", workflowCount: 0 }), "t1", "direct_connect")).toBeNull();
  });

  it("custom_ai_key: everything blocked except self_hosted", async () => {
    for (const plan of ["free", "pro", "team"]) {
      const res = await guardFeature(mockDb({ plan: plan as any, workflowCount: 0 }), "t1", "custom_ai_key");
      expect(res, plan).not.toBeNull();
      const body = await res!.json();
      expect(body.requiredPlan).toBe("self_hosted");
    }
    expect(await guardFeature(mockDb({ plan: "self_hosted", workflowCount: 0 }), "t1", "custom_ai_key")).toBeNull();
  });

  it("expired trial gets free-plan restrictions", async () => {
    const res = await guardFeature(
      mockDb({
        plan: "team",
        plan_status: "trialing",
        trial_ends_at: "2020-01-01T00:00:00Z",
        workflowCount: 0,
      }),
      "t1",
      "direct_connect"
    );
    expect(res).not.toBeNull();
    const body = await res!.json();
    expect(body.currentPlan).toBe("free");
  });
});

describe("workflow cap", () => {
  it("blocks when AT the cap (free, 1 of 1)", async () => {
    const res = await guardWorkflowCap(mockDb({ plan: "free", workflowCount: 1 }), "t1");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
    const body = await res!.json();
    expect(body.feature).toBe("max_workflows");
    expect(body.limit).toBe(1);
  });

  it("allows the first workflow (free, 0 of 1)", async () => {
    expect(await guardWorkflowCap(mockDb({ plan: "free", workflowCount: 0 }), "t1")).toBeNull();
  });

  it("pro blocks at 10, allows 9", async () => {
    expect(await guardWorkflowCap(mockDb({ plan: "pro", workflowCount: 9 }), "t1")).toBeNull();
    const res = await guardWorkflowCap(mockDb({ plan: "pro", workflowCount: 10 }), "t1");
    expect(res).not.toBeNull();
    expect((await res!.json()).requiredPlan).toBe("team"); // pro → next is team
  });

  it("team allows up to 20, self_hosted never caps", async () => {
    expect(await guardWorkflowCap(mockDb({ plan: "team", workflowCount: 19 }), "t1")).toBeNull();
    expect(await guardWorkflowCap(mockDb({ plan: "team", workflowCount: 20 }), "t1")).not.toBeNull();
    expect(await guardWorkflowCap(mockDb({ plan: "self_hosted", workflowCount: 999 }), "t1")).toBeNull();
  });

  it("bulk import respects the remaining room (incoming > 1)", async () => {
    // free has 0 workflows, n8n wants to import 3 → blocked
    const res = await guardWorkflowCap(mockDb({ plan: "free", workflowCount: 0 }), "t1", 3);
    expect(res).not.toBeNull();
    // team has 15, importing 5 more (exactly 20) → allowed
    expect(await guardWorkflowCap(mockDb({ plan: "team", workflowCount: 15 }), "t1", 5)).toBeNull();
  });
});

describe("guardLimit (generic numeric limit)", () => {
  it("at exact limit with incoming 1 → blocked", async () => {
    const res = await guardLimit(mockDb({ plan: "pro", workflowCount: 10 }), "t1", "max_workflows", 10, 1);
    expect(res).not.toBeNull();
  });

  it("below limit → allowed", async () => {
    expect(await guardLimit(mockDb({ plan: "pro", workflowCount: 5 }), "t1", "max_workflows", 5, 1)).toBeNull();
  });
});

describe("guardOverCap (downgrade read-only)", () => {
  it("over the cap → 403 read-only", async () => {
    // 15 workflows on a plan that now allows 1
    const res = await guardOverCap(mockDb({ plan: "free", workflowCount: 15 }), "t1");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
  });

  it("exactly at cap → NOT read-only (normal operation)", async () => {
    expect(await guardOverCap(mockDb({ plan: "free", workflowCount: 1 }), "t1")).toBeNull();
    expect(await guardOverCap(mockDb({ plan: "pro", workflowCount: 10 }), "t1")).toBeNull();
  });
});

describe("history retention", () => {
  it("free hides snapshots older than 10 days", async () => {
    const ent = await loadEntitlements(mockDb({ plan: "free", workflowCount: 0 }), "t1");
    const cutoff = historyCutoff(ent)!;
    const age = Date.now() - new Date(cutoff).getTime();
    expect(age).toBeGreaterThan(9.9 * 24 * 3600 * 1000);
    expect(age).toBeLessThan(10.1 * 24 * 3600 * 1000);
  });

  it("pro 30d, team 50d", async () => {
    const pro = await loadEntitlements(mockDb({ plan: "pro", workflowCount: 0 }), "t1");
    const team = await loadEntitlements(mockDb({ plan: "team", workflowCount: 0 }), "t1");
    expect(Date.now() - new Date(historyCutoff(pro)!).getTime()).toBeCloseTo(30 * 24 * 3600 * 1000, -4);
    expect(Date.now() - new Date(historyCutoff(team)!).getTime()).toBeCloseTo(50 * 24 * 3600 * 1000, -4);
  });

  it("self_hosted keeps everything (no cutoff)", async () => {
    const ent = await loadEntitlements(mockDb({ plan: "self_hosted", workflowCount: 0 }), "t1");
    expect(historyCutoff(ent)).toBeNull();
  });
});

describe("planLimitResponse", () => {
  it("is always 403 with the standard body", async () => {
    const ent = await loadEntitlements(mockDb({ plan: "free", workflowCount: 1 }), "t1");
    const { planLimitError } = await import("@flowlens/core");
    const res = planLimitResponse(planLimitError(ent, "max_workflows"));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe("PLAN_LIMIT");
    expect(body.currentPlan).toBe("free");
    expect(body.requiredPlan).toBe("pro");
  });
});
