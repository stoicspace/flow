// ─────────────────────────────────────────────────────────────
// POST /api/billing/webhook
// Billing provider (Stripe etc.) webhook — STUB.
//
// restrictions.md §7: structure it so a billing provider only ever
// needs to update plan / plan_status / trial_ends_at. When Stripe is
// actually wired up, this handler will:
//   1. verify the Stripe signature (TODO below)
//   2. map the event to those three fields
//   3. run the same update below
//
// For now it accepts a plain JSON payload so the flow can be tested
// end-to-end with curl, and rejects when not configured with test
// data. Auth: WEBHOOK_SECRET header, same convention as /api/webhooks/*.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { PlanId, PlanStatus } from "@flowlens/core";

const PLANS: PlanId[] = ["free", "pro", "team", "self_hosted"];
const STATUSES: PlanStatus[] = ["active", "trialing", "past_due", "canceled"];

export async function POST(request: Request) {
  // TODO(stripe): verify `stripe-signature` header once Stripe is
  // integrated. Until then we accept a shared-secret header instead.
  const secret = request.headers.get("x-flowlens-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { teamId, plan, planStatus, trialEndsAt } = body;
  if (!teamId || !PLANS.includes(plan)) {
    return NextResponse.json(
      { error: "teamId and a valid plan are required" },
      { status: 400 }
    );
  }
  if (planStatus !== undefined && !STATUSES.includes(planStatus)) {
    return NextResponse.json({ error: "Invalid planStatus" }, { status: 400 });
  }

  const update: Record<string, unknown> = { plan };
  if (planStatus !== undefined) update.plan_status = planStatus;
  if (trialEndsAt !== undefined) update.trial_ends_at = trialEndsAt;

  const db = createServiceClient();
  const { error } = await db.from("flowlens_teams").update(update).eq("id", teamId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
