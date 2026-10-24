// ─────────────────────────────────────────────────────────────
// POST /api/admin/set-plan
// Set any account's plan — used by the admin dashboard's inline
// plan editor, and as the dev/test override required by
// restrictions.md §7 ("admin/dev override to set a plan").
//
// Body: { teamId, plan, planStatus?, trialEndsAt? }
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { PlanId, PlanStatus } from "@flowlens/core";
import { requireAdmin, isAdminError } from "@/lib/billing/admin";

const PLANS: PlanId[] = ["free", "pro", "team", "self_hosted"];
const STATUSES: PlanStatus[] = ["active", "trialing", "past_due", "canceled"];

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (isAdminError(admin)) return admin;
  const { db } = admin;

  const body = await request.json();
  const { teamId, plan, planStatus, trialEndsAt } = body;

  if (!teamId || !PLANS.includes(plan)) {
    return NextResponse.json(
      { error: "teamId and a valid plan (free|pro|team|self_hosted) are required" },
      { status: 400 }
    );
  }
  if (planStatus !== undefined && !STATUSES.includes(planStatus)) {
    return NextResponse.json({ error: "Invalid planStatus" }, { status: 400 });
  }

  const update: Record<string, unknown> = { plan };
  if (planStatus !== undefined) update.plan_status = planStatus;
  if (trialEndsAt !== undefined) update.trial_ends_at = trialEndsAt; // null clears it

  const { data, error } = await db
    .from("flowlens_teams")
    .update(update)
    .eq("id", teamId)
    .select("id, name, plan, plan_status, trial_ends_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ team: data });
}
