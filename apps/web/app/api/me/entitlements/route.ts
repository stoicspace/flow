// ─────────────────────────────────────────────────────────────
// GET /api/me/entitlements
// "What can my account do?" — the one endpoint the frontend calls
// to render usage meters and locked-with-upgrade features.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { PLANS } from "@flowlens/core";
import { loadEntitlements } from "@/lib/billing/entitlements";

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const ent = await loadEntitlements(db, teamId);

  // Usage numbers for the meters ("1 of 1 workflows").
  const [{ count: workflowCount }, { count: seatCount }] = await Promise.all([
    db
      .from("flowlens_workflows")
      .select("id", { count: "exact", head: true })
      .eq("team_id", teamId),
    db
      .from("flowlens_profiles")
      .select("id", { count: "exact", head: true })
      .eq("team_id", teamId),
  ]);

  // JSON has no Infinity — it serialises as null, which is exactly
  // what we want here: null means "unlimited" on the wire.
  const wire = (n: number) => (n === Infinity ? null : n);

  return NextResponse.json({
    entitlements: {
      ...ent,
      maxWorkflows: wire(ent.maxWorkflows),
      historyDays: wire(ent.historyDays),
      maxSeats: wire(ent.maxSeats),
    },
    usage: {
      workflows: workflowCount ?? 0,
      seats: seatCount ?? 0,
    },
    // The raw rulebook too, so the UI can say what the NEXT plan
    // would give without hardcoding anything.
    plans: Object.fromEntries(
      Object.entries(PLANS).map(([id, p]) => [
        id,
        {
          name: p.name,
          priceMonthlyUsd: p.priceMonthlyUsd,
          limits: {
            maxWorkflows: wire(p.limits.maxWorkflows),
            historyDays: wire(p.limits.historyDays),
            maxSeats: wire(p.limits.maxSeats),
          },
          features: p.features,
        },
      ])
    ),
  });
}
