// ─────────────────────────────────────────────────────────────
// Tests for the plan rulebook (restrictions.md §1, §8).
// Run: npm run test --workspace=packages/core
// ─────────────────────────────────────────────────────────────
import { describe, it, expect } from "vitest";
import {
  PLANS,
  getEntitlements,
  resolveEffectivePlan,
  canUse,
  getLimit,
  planLimitError,
} from "./plans";

const account = (over: Partial<{ plan: any; plan_status: any; trial_ends_at: any }> = {}) => ({
  plan: "free",
  plan_status: "active",
  trial_ends_at: null,
  ...over,
});

const inTwoDays = () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
const threeDaysAgo = () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

describe("PLANS rulebook matches restrictions.md", () => {
  it("has the exact limits from the spec table", () => {
    expect(PLANS.free.limits).toEqual({ maxWorkflows: 1, historyDays: 10, maxSeats: 1 });
    expect(PLANS.pro.limits).toEqual({ maxWorkflows: 10, historyDays: 30, maxSeats: 1 });
    expect(PLANS.team.limits).toEqual({ maxWorkflows: 20, historyDays: 50, maxSeats: 3 });
    expect(PLANS.self_hosted.limits.maxWorkflows).toBe(Infinity);
    expect(PLANS.self_hosted.limits.historyDays).toBe(Infinity);
    expect(PLANS.self_hosted.limits.maxSeats).toBe(Infinity);
  });

  it("gates direct connect to team/self_hosted only", () => {
    expect(PLANS.free.features.directConnect).toBe(false);
    expect(PLANS.pro.features.directConnect).toBe(false);
    expect(PLANS.team.features.directConnect).toBe(true);
    expect(PLANS.self_hosted.features.directConnect).toBe(true);
  });

  it("gates custom AI key to self_hosted only", () => {
    expect(PLANS.free.features.customAiKey).toBe(false);
    expect(PLANS.pro.features.customAiKey).toBe(false);
    expect(PLANS.team.features.customAiKey).toBe(false);
    expect(PLANS.self_hosted.features.customAiKey).toBe(true);
  });

  it("gates workflow ACL to team/self_hosted only", () => {
    expect(PLANS.free.features.workflowAcl).toBe(false);
    expect(PLANS.pro.features.workflowAcl).toBe(false);
    expect(PLANS.team.features.workflowAcl).toBe(true);
    expect(PLANS.self_hosted.features.workflowAcl).toBe(true);
  });

  it("keeps diffs / fixes / paste-json import on EVERY plan", () => {
    for (const id of ["free", "pro", "team", "self_hosted"] as const) {
      expect(PLANS[id].features.plainLanguageDiffs).toBe(true);
      expect(PLANS[id].features.proposedFixes).toBe(true);
      expect(PLANS[id].features.pasteJsonImport).toBe(true);
    }
  });

  it("has the spec pricing", () => {
    expect(PLANS.free.priceMonthlyUsd).toBe(0);
    expect(PLANS.pro.priceMonthlyUsd).toBe(30);
    expect(PLANS.team.priceMonthlyUsd).toBe(100);
    expect(PLANS.self_hosted.priceMonthlyUsd).toBeNull();
  });
});

describe("getEntitlements", () => {
  it("gives each active plan its own limits", () => {
    expect(getEntitlements(account({ plan: "free" })).maxWorkflows).toBe(1);
    expect(getEntitlements(account({ plan: "pro" })).maxWorkflows).toBe(10);
    expect(getEntitlements(account({ plan: "team" })).maxWorkflows).toBe(20);
    expect(getEntitlements(account({ plan: "self_hosted" })).maxWorkflows).toBe(Infinity);
  });

  it("treats an active trial as its plan", () => {
    const ent = getEntitlements(
      account({ plan: "pro", plan_status: "trialing", trial_ends_at: inTwoDays() })
    );
    expect(ent.effectivePlan).toBe("pro");
    expect(ent.trialActive).toBe(true);
    expect(ent.maxWorkflows).toBe(10);
  });

  it("falls back to free when a trial EXPIRED", () => {
    const ent = getEntitlements(
      account({ plan: "team", plan_status: "trialing", trial_ends_at: threeDaysAgo() })
    );
    expect(ent.effectivePlan).toBe("free");
    expect(ent.trialActive).toBe(false);
    expect(ent.maxWorkflows).toBe(1);
    expect(ent.canDirectConnect).toBe(false);
    // data fields still readable — downgrade never deletes
    expect(ent.storedPlan).toBe("team");
  });

  it("treats canceled as free regardless of stored plan", () => {
    const ent = getEntitlements(account({ plan: "pro", plan_status: "canceled" }));
    expect(ent.effectivePlan).toBe("free");
    expect(ent.maxWorkflows).toBe(1);
  });

  it("resolveEffectivePlan respects explicit now", () => {
    const now = new Date("2030-01-10T00:00:00Z");
    const a = account({ plan: "pro", plan_status: "trialing", trial_ends_at: "2030-01-05T00:00:00Z" });
    expect(resolveEffectivePlan(a, now)).toBe("free");
    const b = account({ plan: "pro", plan_status: "trialing", trial_ends_at: "2030-01-15T00:00:00Z" });
    expect(resolveEffectivePlan(b, now)).toBe("pro");
  });
});

describe("canUse / getLimit", () => {
  const free = getEntitlements(account({ plan: "free" }));
  const pro = getEntitlements(account({ plan: "pro" }));
  const team = getEntitlements(account({ plan: "team" }));
  const sh = getEntitlements(account({ plan: "self_hosted" }));

  it("feature gates", () => {
    expect(canUse(free, "direct_connect")).toBe(false);
    expect(canUse(pro, "direct_connect")).toBe(false);
    expect(canUse(team, "direct_connect")).toBe(true);
    expect(canUse(sh, "direct_connect")).toBe(true);

    expect(canUse(pro, "custom_ai_key")).toBe(false);
    expect(canUse(sh, "custom_ai_key")).toBe(true);

    expect(canUse(free, "proposed_fixes")).toBe(true);
    expect(canUse(free, "paste_json_import")).toBe(true);
    expect(canUse(free, "plain_language_diffs")).toBe(true);
  });

  it("numeric limits", () => {
    expect(getLimit(free, "max_workflows")).toBe(1);
    expect(getLimit(pro, "history_days")).toBe(30);
    expect(getLimit(team, "max_seats")).toBe(3);
    expect(getLimit(sh, "max_workflows")).toBe(Infinity);
  });
});

describe("planLimitError (the 403 body)", () => {
  it("free user at the 1-workflow cap → upgrade to pro", () => {
    const ent = getEntitlements(account({ plan: "free" }));
    const err = planLimitError(ent, "max_workflows");
    expect(err).toEqual({
      code: "PLAN_LIMIT",
      feature: "max_workflows",
      limit: 1,
      currentPlan: "free",
      requiredPlan: "pro",
    });
  });

  it("PRO user at their cap → upgrade to team (not pro again)", () => {
    const ent = getEntitlements(account({ plan: "pro" }));
    const err = planLimitError(ent, "max_workflows");
    expect(err.requiredPlan).toBe("team");
    expect(err.limit).toBe(10);
  });

  it("free direct_connect → required team, limit null", () => {
    const ent = getEntitlements(account({ plan: "free" }));
    const err = planLimitError(ent, "direct_connect");
    expect(err.requiredPlan).toBe("team");
    expect(err.limit).toBeNull();
    expect(err.code).toBe("PLAN_LIMIT");
  });

  it("custom_ai_key → required self_hosted", () => {
    const ent = getEntitlements(account({ plan: "team" }));
    const err = planLimitError(ent, "custom_ai_key");
    expect(err.requiredPlan).toBe("self_hosted");
    expect(err.currentPlan).toBe("team");
  });
});
