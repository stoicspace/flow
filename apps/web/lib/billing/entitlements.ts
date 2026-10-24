// ─────────────────────────────────────────────────────────────
// src/lib/billing/entitlements.ts
// Server-side helpers around the plan rulebook in
// @flowlens/core (packages/core/src/plans.ts).
//
// Every restricted API route does one of two things:
//
//   const gate = await guardFeature(db, teamId, "direct_connect");
//   if (gate) return gate;                       // 403 PLAN_LIMIT
//
//   const cap = await guardWorkflowCap(db, teamId);
//   if (cap) return cap;                         // 403 PLAN_LIMIT
//
// No route ever hardcodes a limit — it all lives in plans.ts.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import {
  getEntitlements,
  planLimitError,
  canUse,
  getLimit,
  type Entitlements,
  type FeatureName,
  type LimitName,
  type PlanLimitError,
} from "@flowlens/core";

type DbLike = any;

// Re-exported so routes can build the standard error body directly
// (e.g. the history-retention 403 in GET /api/snapshots/[id]).
export { planLimitError } from "@flowlens/core";

// The plan fields we need from flowlens_teams.
export interface TeamPlanRow {
  plan: string;
  plan_status: string;
  trial_ends_at: string | null;
}

// Load a team's plan and build its entitlements.
// If the team row can't be read we fail CLOSED (treat as Free, the
// most restrictive plan) instead of letting limits slip through.
export async function loadEntitlements(
  db: DbLike,
  teamId: string
): Promise<Entitlements> {
  const { data, error } = await db
    .from("flowlens_teams")
    .select("plan, plan_status, trial_ends_at")
    .eq("id", teamId)
    .single();

  if (error || !data) {
    // Fail closed: if we can't read the plan, treat the account as
    // Free (the most restrictive plan) rather than letting limits
    // slip through.
    return getEntitlements({
      plan: "free",
      plan_status: "active",
      trial_ends_at: null,
    });
  }

  return getEntitlements({
    plan: data.plan ?? "free",
    plan_status: data.plan_status ?? "active",
    trial_ends_at: data.trial_ends_at,
  });
}

// The standard 403 response for any plan restriction.
export function planLimitResponse(err: PlanLimitError): NextResponse {
  return NextResponse.json(err, { status: 403 });
}

// Gate a yes/no feature (direct_connect, custom_ai_key, workflow_acl).
// Returns null when allowed, otherwise the 403 response to return.
export async function guardFeature(
  db: DbLike,
  teamId: string,
  feature: FeatureName
): Promise<NextResponse | null> {
  const ent = await loadEntitlements(db, teamId);
  if (canUse(ent, feature)) return null;
  return planLimitResponse(planLimitError(ent, feature));
}

// Gate a numeric limit you're about to exceed (e.g. adding one more
// workflow when already at the cap).
//   currentUsage = how many exist now, incoming = how many you're adding
export async function guardLimit(
  db: DbLike,
  teamId: string,
  limit: LimitName,
  currentUsage: number,
  incoming = 1
): Promise<NextResponse | null> {
  const ent = await loadEntitlements(db, teamId);
  const max = getLimit(ent, limit);
  if (currentUsage + incoming <= max) return null;
  return planLimitResponse(planLimitError(ent, limit));
}

// Convenience: block creating a workflow when the cap is already hit.
// Call BEFORE inserting; counts existing workflows for the team.
export async function guardWorkflowCap(
  db: DbLike,
  teamId: string,
  incoming = 1
): Promise<NextResponse | null> {
  const { count } = await db
    .from("flowlens_workflows")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId);
  return guardLimit(db, teamId, "max_workflows", count ?? 0, incoming);
}

// Downgrade safety: over the cap already (e.g. was Pro with 15
// workflows, demoted to Free)? Everything becomes read-only until
// the account is back under the cap. Returns null when at/below cap.
export async function guardOverCap(db: DbLike, teamId: string): Promise<NextResponse | null> {
  const ent = await loadEntitlements(db, teamId);
  const { count } = await db
    .from("flowlens_workflows")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId);
  if ((count ?? 0) <= ent.maxWorkflows) return null;
  return planLimitResponse(planLimitError(ent, "max_workflows"));
}

// History cutoff: ISO date string before which snapshots are hidden.
// Infinity retention → null (no cutoff, show everything).
export function historyCutoff(ent: Entitlements, now: Date = new Date()): string | null {
  if (ent.historyDays === Infinity) return null;
  const cutoff = new Date(now.getTime() - ent.historyDays * 24 * 60 * 60 * 1000);
  return cutoff.toISOString();
}
