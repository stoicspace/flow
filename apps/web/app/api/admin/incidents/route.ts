// ─────────────────────────────────────────────────────────────
// GET /api/admin/incidents — recent open incidents across all
// accounts, newest first.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAdmin, isAdminError } from "@/lib/billing/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (isAdminError(admin)) return admin;
  const { db } = admin;

  const { data, error } = await db
    .from("flowlens_incidents")
    .select("id, team_id, workflow_id, status, error_message, detected_at")
    .order("detected_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with workflow + team names (best effort, one batch query).
  const rows = data ?? [];
  const wfIds = [...new Set(rows.map((r: any) => r.workflow_id).filter(Boolean))];
  const teamIds = [...new Set(rows.map((r: any) => r.team_id).filter(Boolean))];

  const [wfs, teams] = await Promise.all([
    wfIds.length
      ? db.from("flowlens_workflows").select("id, name").in("id", wfIds)
      : Promise.resolve({ data: [] }),
    teamIds.length
      ? db.from("flowlens_teams").select("id, name").in("id", teamIds)
      : Promise.resolve({ data: [] }),
  ]);

  const wfName = new Map((wfs.data ?? []).map((w: any) => [w.id, w.name]));
  const teamName = new Map((teams.data ?? []).map((t: any) => [t.id, t.name]));

  return NextResponse.json({
    incidents: rows.map((r: any) => ({
      ...r,
      workflow_name: wfName.get(r.workflow_id) ?? "—",
      team_name: teamName.get(r.team_id) ?? "—",
    })),
  });
}
