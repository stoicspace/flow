// ─────────────────────────────────────────────────────────────
// API-level enforcement tests (restrictions.md §8: "integration
// tests proving each restriction is enforced at the API level").
//
// Each test invokes the real route handler with a mocked session
// and a fake Supabase client — asserting the HTTP status + body
// a real client would receive.
// ─────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// ── fake session/db ──────────────────────────────────────────
const session = {
  user: { id: "user-1" },
  teamId: "team-1",
  role: "owner",
  supabase: {},
  db: null as any,
};

function mockDb(plan: string, workflowCount: number) {
  return {
    from(table: string) {
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        gte: () => chain,
        insert: () => chain,
        upsert: () => chain,
        single: () =>
          Promise.resolve(
            table === "flowlens_teams"
              ? { data: { plan, plan_status: "active", trial_ends_at: null }, error: null }
              : { data: { id: "wf-1", name: "n", platform: "n8n" }, error: null }
          ),
        then: (resolve: any) =>
          resolve(
            table === "flowlens_workflows" && !chain._insert
              ? { count: workflowCount }
              : { count: workflowCount, data: [], error: null }
          ),
      };
      chain.insert = () => { chain._insert = true; return chain; };
      return chain;
    },
  };
}

vi.mock("@/lib/supabase/auth-helper", () => ({
  getAuthContext: vi.fn(async () => ({ ...session, db: session.db })),
}));

// Storage adapter is thin glue over the same fake db — stub its
// createWorkflow so the "allowed" path resolves cleanly.
vi.mock("@flowlens/storage-supabase", () => ({
  SupabaseStorageAdapter: class {
    constructor(public db: any) {}
    async createWorkflow(_teamId: string, data: any) {
      return { id: "wf-new", ...data };
    }
  },
}));

const jsonRequest = (body: any) =>
  new Request("http://localhost/api/workflows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/workflows — workflow cap", () => {
  beforeEach(() => {
    session.db = mockDb("free", 1); // free user already has 1 workflow
  });

  it("403s with PLAN_LIMIT when at the free cap", async () => {
    const { POST } = await import("./route");
    const res = await POST(jsonRequest({ name: "second", platform: "n8n" }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({
      code: "PLAN_LIMIT",
      feature: "max_workflows",
      limit: 1,
      currentPlan: "free",
      requiredPlan: "pro",
    });
  });

  it("does NOT block when under the cap", async () => {
    session.db = mockDb("free", 0);
    const { POST } = await import("./route");
    const res = await POST(jsonRequest({ name: "first", platform: "n8n" }));
    expect(res.status).not.toBe(403);
    expect(res.status).not.toBe(402);
  });

  it("allows a pro user up to 10 and blocks at 10", async () => {
    session.db = mockDb("pro", 9);
    const { POST } = await import("./route");
    const ok = await POST(jsonRequest({ name: "w", platform: "n8n" }));
    expect(ok.status).not.toBe(403);

    session.db = mockDb("pro", 10);
    const blocked = await POST(jsonRequest({ name: "w", platform: "n8n" }));
    expect(blocked.status).toBe(403);
    expect((await blocked.json()).requiredPlan).toBe("team");
  });

  it("never caps self_hosted", async () => {
    session.db = mockDb("self_hosted", 500);
    const { POST } = await import("./route");
    const res = await POST(jsonRequest({ name: "w", platform: "n8n" }));
    expect(res.status).not.toBe(403);
  });

  it("401s when logged out", async () => {
    const { getAuthContext } = await import("@/lib/supabase/auth-helper");
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: undefined as any,
      teamId: undefined as any,
      role: undefined as any,
      supabase: undefined as any,
      db: undefined as any,
    });
    const { POST } = await import("./route");
    const res = await POST(jsonRequest({ name: "w", platform: "n8n" }));
    expect(res.status).toBe(401);
  });
});
