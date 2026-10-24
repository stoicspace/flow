// ─────────────────────────────────────────────────────────────
// GET /api/admin/stats — headline numbers for the admin Overview.
// Every stat is independent: if one query fails the rest still
// come through (counts fall back to 0).
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAdmin, isAdminError } from "@/lib/billing/admin";

async function count(db: any, table: string, filter?: (q: any) => any) {
  try {
    let q = db.from(table).select("id", { count: "exact", head: true });
    if (filter) q = filter(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const admin = await requireAdmin();
  if (isAdminError(admin)) return admin;
  const { db } = admin;

  const days = (n: number) =>
    new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

  const planCounts = await (async () => {
    try {
      const { data, error } = await db
        .from("flowlens_teams")
        .select("plan");
      if (error || !data) return { free: 0, pro: 0, team: 0, self_hosted: 0 };
      const out = { free: 0, pro: 0, team: 0, self_hosted: 0 };
      data.forEach((r: any) => {
        if (r.plan in out) out[r.plan as keyof typeof out] += 1;
      });
      return out;
    } catch {
      return { free: 0, pro: 0, team: 0, self_hosted: 0 };
    }
  })();

  const [
    accounts,
    workflows,
    profiles,
    openIncidents,
    waitlist,
    signups7d,
    signups30d,
  ] = await Promise.all([
    count(db, "flowlens_teams"),
    count(db, "flowlens_workflows"),
    count(db, "flowlens_profiles"),
    count(db, "flowlens_incidents", (q) => q.eq("status", "open")),
    count(db, "flowlens_waitlist"),
    count(db, "flowlens_teams", (q) => q.gte("created_at", days(7))),
    count(db, "flowlens_teams", (q) => q.gte("created_at", days(30))),
  ]);

  return NextResponse.json({
    accounts,
    plans: planCounts,
    workflows,
    users: profiles,
    openIncidents,
    waitlist,
    signups7d,
    signups30d,
  });
}
