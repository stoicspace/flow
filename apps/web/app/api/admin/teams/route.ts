// ─────────────────────────────────────────────────────────────
// GET /api/admin/teams — every account with its plan and usage,
// for the Accounts table.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAdmin, isAdminError } from "@/lib/billing/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (isAdminError(admin)) return admin;
  const { db } = admin;

  // created_at is standard on these tables but we didn't create them
  // here — fall back gracefully if it's somehow missing.
  let teams: any[] | null = null;
  const first = await db
    .from("flowlens_teams")
    .select("id, name, plan, plan_status, trial_ends_at, created_at")
    .order("created_at", { ascending: false });
  if (!first.error) {
    teams = first.data;
  } else {
    const retry = await db
      .from("flowlens_teams")
      .select("id, name, plan, plan_status, trial_ends_at")
      .order("name");
    teams = retry.data;
  }
  if (!teams) teams = [];

  // Usage per team: workflow count, seat count, connected platforms.
  const rows = await Promise.all(
    teams.map(async (t) => {
      const [wf, seats, platforms] = await Promise.all([
        db
          .from("flowlens_workflows")
          .select("id", { count: "exact", head: true })
          .eq("team_id", t.id),
        db
          .from("flowlens_profiles")
          .select("id", { count: "exact", head: true })
          .eq("team_id", t.id),
        db
          .from("flowlens_platforms")
          .select("platform, status")
          .eq("team_id", t.id),
      ]);
      return {
        ...t,
        workflows: wf.count ?? 0,
        seats: seats.count ?? 0,
        platforms: platforms.data ?? [],
      };
    })
  );

  return NextResponse.json({ teams: rows });
}
