// ─────────────────────────────────────────────────────────────
// packages/core/src/plans.ts
// The single source of truth for what each plan gets.
//
// Every limit, gate, usage meter and upgrade prompt in FlowLens is
// derived from this file. Never hardcode a limit anywhere else —
// when pricing changes after market evaluation, this is the one
// file to edit.
//
// Zero dependencies: plain objects in, plain objects out, so it
// runs identically in Next.js server routes, tests, and Electron.
// ─────────────────────────────────────────────────────────────

// The four plans an account can be on.
export type PlanId = "free" | "pro" | "team" | "self_hosted";

// Lifecycle of the subscription itself (independent of which plan).
export type PlanStatus = "active" | "trialing" | "past_due" | "canceled";

// Plan-shaped subset of a team/account row. Any object with these
// fields works — routes pass the flowlens_teams row directly.
export interface PlanAccount {
  plan: PlanId;
  plan_status: PlanStatus;
  trial_ends_at?: string | null;
}

// What an account can actually do right now.
export interface Entitlements {
  // The plan that is in force today. A trialing team on "pro" has
  // effectivePlan "pro"; an expired trial falls back to "free".
  effectivePlan: PlanId;
  // Raw stored values, so the UI can show "Trial ends Oct 30".
  storedPlan: PlanId;
  planStatus: PlanStatus;
  trialEndsAt: string | null;
  trialActive: boolean;

  // Feature gates (booleans — the easy yes/no questions).
  canDirectConnect: boolean; // n8n/Make connect + auto sync
  canUseCustomAiKey: boolean; // bring your own key / endpoint
  canUseWorkflowAcl: boolean; // per-workflow permissions

  // Numeric limits.
  maxWorkflows: number; // Infinity = no cap
  historyDays: number; // Infinity = keep forever
  maxSeats: number; // Infinity = no cap
}

// The static rulebook: what each plan costs and gets.
// Number === cap, Infinity === unlimited.
export const PLANS: Record<
  PlanId,
  {
    name: string;
    priceMonthlyUsd: number | null; // null = contact sales
    limits: {
      maxWorkflows: number;
      historyDays: number;
      maxSeats: number;
    };
    features: {
      directConnect: boolean;
      customAiKey: boolean;
      workflowAcl: boolean;
      plainLanguageDiffs: boolean; // on all plans today, kept for clarity
      proposedFixes: boolean; // on all plans today, kept for clarity
      pasteJsonImport: boolean; // on all plans today, kept for clarity
    };
  }
> = {
  free: {
    name: "Free",
    priceMonthlyUsd: 0,
    limits: { maxWorkflows: 1, historyDays: 10, maxSeats: 1 },
    features: {
      directConnect: false,
      customAiKey: false,
      workflowAcl: false,
      plainLanguageDiffs: true,
      proposedFixes: true,
      pasteJsonImport: true,
    },
  },
  pro: {
    name: "Pro",
    priceMonthlyUsd: 30,
    limits: { maxWorkflows: 10, historyDays: 30, maxSeats: 1 },
    features: {
      directConnect: false,
      customAiKey: false,
      workflowAcl: false,
      plainLanguageDiffs: true,
      proposedFixes: true,
      pasteJsonImport: true,
    },
  },
  team: {
    name: "Team",
    priceMonthlyUsd: 100,
    limits: { maxWorkflows: 20, historyDays: 50, maxSeats: 3 },
    features: {
      directConnect: true,
      customAiKey: false,
      workflowAcl: true,
      plainLanguageDiffs: true,
      proposedFixes: true,
      pasteJsonImport: true,
    },
  },
  self_hosted: {
    name: "Self-hosted",
    priceMonthlyUsd: null,
    limits: { maxWorkflows: Infinity, historyDays: Infinity, maxSeats: Infinity },
    features: {
      directConnect: true,
      customAiKey: true,
      workflowAcl: true,
      plainLanguageDiffs: true,
      proposedFixes: true,
      pasteJsonImport: true,
    },
  },
};

// Feature names used in API errors so the frontend can word its
// upgrade prompts consistently.
export type FeatureName =
  | "direct_connect"
  | "custom_ai_key"
  | "workflow_acl"
  | "plain_language_diffs"
  | "proposed_fixes"
  | "paste_json_import";

export type LimitName = "max_workflows" | "history_days" | "max_seats";

// Which plan is the minimum for a gated feature/limit.
// (Used to answer "Upgrade to Team" in the UI.)
const FEATURE_REQUIRED_PLAN: Record<FeatureName, PlanId> = {
  direct_connect: "team",
  custom_ai_key: "self_hosted",
  workflow_acl: "team",
  plain_language_diffs: "free",
  proposed_fixes: "free",
  paste_json_import: "free",
};

// Plan order, cheapest first — used to find the next plan up.
const PLAN_ORDER: PlanId[] = ["free", "pro", "team", "self_hosted"];

// The error body every restricted API route returns.
// HTTP status: 403 (see lib/billing/requirePlan.ts).
export interface PlanLimitError {
  code: "PLAN_LIMIT";
  feature: FeatureName | LimitName;
  limit: number | null; // numeric cap when relevant (null for feature gates)
  currentPlan: PlanId;
  requiredPlan: PlanId;
}

// Is a trial still within its window?
function trialIsActive(account: PlanAccount, now: Date): boolean {
  if (account.plan_status !== "trialing") return false;
  if (!account.trial_ends_at) return false;
  return new Date(account.trial_ends_at).getTime() > now.getTime();
}

// Resolve which plan is really in force right now.
// - trialing and not expired  → the trial's plan
// - trialing and expired      → free (fallback, data preserved)
// - active / past_due / cancel → the stored plan as-is
export function resolveEffectivePlan(
  account: PlanAccount,
  now: Date = new Date()
): PlanId {
  if (account.plan_status === "canceled") return "free";
  if (trialIsActive(account, now)) return account.plan;
  if (account.plan_status === "trialing") return "free"; // expired trial
  return account.plan;
}

// Build the full entitlement object for an account.
// This is what routes and the /api/me/entitlements endpoint use.
export function getEntitlements(
  account: PlanAccount,
  now: Date = new Date()
): Entitlements {
  const effectivePlan = resolveEffectivePlan(account, now);
  const plan = PLANS[effectivePlan];

  return {
    effectivePlan,
    storedPlan: account.plan,
    planStatus: account.plan_status,
    trialEndsAt: account.trial_ends_at ?? null,
    trialActive: trialIsActive(account, now),

    canDirectConnect: plan.features.directConnect,
    canUseCustomAiKey: plan.features.customAiKey,
    canUseWorkflowAcl: plan.features.workflowAcl,

    maxWorkflows: plan.limits.maxWorkflows,
    historyDays: plan.limits.historyDays,
    maxSeats: plan.limits.maxSeats,
  };
}

// Can this account use a gated feature right now?
export function canUse(ent: Entitlements, feature: FeatureName): boolean {
  switch (feature) {
    case "direct_connect":
      return ent.canDirectConnect;
    case "custom_ai_key":
      return ent.canUseCustomAiKey;
    case "workflow_acl":
      return ent.canUseWorkflowAcl;
    case "plain_language_diffs":
    case "proposed_fixes":
    case "paste_json_import":
      return true; // on every plan
  }
}

// Numeric limit for an account (Infinity where unlimited).
export function getLimit(
  ent: Entitlements,
  limit: LimitName
): number {
  switch (limit) {
    case "max_workflows":
      return ent.maxWorkflows;
    case "history_days":
      return ent.historyDays;
    case "max_seats":
      return ent.maxSeats;
  }
}

// The plan an account would need to use a feature it lacks.
// Feature gates are static (e.g. custom AI key always needs
// self_hosted) — except custom_ai_key which is self_hosted only.
export function requiredPlanFor(
  what: FeatureName | LimitName,
  currentLimit?: number
): PlanId {
  if (what in FEATURE_REQUIRED_PLAN) {
    return FEATURE_REQUIRED_PLAN[what as FeatureName];
  }
  // For numeric limits: the cheapest plan with a HIGHER cap than
  // the one we have now. A free user at 1 workflow needs pro;
  // a pro user at 10 needs team (not pro again).
  return nextPlanForLimit(what as LimitName, currentLimit);
}

function nextPlanForLimit(limit: LimitName, currentLimit?: number): PlanId {
  const current = currentLimit ?? 0;
  for (const id of PLAN_ORDER) {
    if (getLimitFromPlan(id, limit) > current) return id;
  }
  return "self_hosted";
}

function getLimitFromPlan(plan: PlanId, limit: LimitName): number {
  const l = PLANS[plan].limits;
  switch (limit) {
    case "max_workflows":
      return l.maxWorkflows;
    case "history_days":
      return l.historyDays;
    case "max_seats":
      return l.maxSeats;
  }
}

// Build the standard PLAN_LIMIT error for a blocked feature.
export function planLimitError(
  ent: Entitlements,
  what: FeatureName | LimitName
): PlanLimitError {
  const limit = isLimitName(what) ? getLimit(ent, what) : null;
  return {
    code: "PLAN_LIMIT",
    feature: what,
    limit,
    currentPlan: ent.effectivePlan,
    requiredPlan: requiredPlanFor(what, limit ?? undefined),
  };
}

function isLimitName(what: FeatureName | LimitName): what is LimitName {
  return what === "max_workflows" || what === "history_days" || what === "max_seats";
}
