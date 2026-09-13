// ─────────────────────────────────────────────────────────────
// src/app/api/notifications/stats/route.ts
// GET /api/notifications/stats — feeds the "Notification Health"
// sidebar: uptime, total alerts, avg resolve time, common issues.
// All numbers are computed from real rows, trailing 30 days.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

const WINDOW_DAYS = 30;
const CATEGORY_LABELS: Record<string, string> = {
  incident: "Workflow Incidents",
  rate_limit: "API Rate Limits",
  schema_mismatch: "Schema Mismatches",
  auth_expiry: "Auth Token Expiry",
  ai_suggestion: "AI Suggestions",
  system: "System Events",
  other: "Other",
};

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [snapsRes, alertsRes, resolvedRes, categoryRes] = await Promise.all([
    db
      .from("flowlens_snapshots")
      .select("execution_status")
      .eq("team_id", teamId)
      .gte("created_at", since),
    db
      .from("flowlens_notifications")
      .select("id", { count: "exact", head: true })
      .eq("team_id", teamId)
      .gte("created_at", since),
    db
      .from("flowlens_incidents")
      .select("detected_at, resolved_at")
      .eq("team_id", teamId)
      .eq("status", "resolved")
      .not("resolved_at", "is", null)
      .gte("detected_at", since),
    db
      .from("flowlens_notifications")
      .select("category, type")
      .eq("team_id", teamId)
      .gte("created_at", since),
  ]);

  if (snapsRes.error) return NextResponse.json({ error: snapsRes.error.message }, { status: 500 });
  if (alertsRes.error) return NextResponse.json({ error: alertsRes.error.message }, { status: 500 });
  if (resolvedRes.error) return NextResponse.json({ error: resolvedRes.error.message }, { status: 500 });
  if (categoryRes.error) return NextResponse.json({ error: categoryRes.error.message }, { status: 500 });

  // Uptime: % of executions that succeeded in the window. Real signal,
  // not literal server uptime — rename on the frontend if that distinction matters.
  const snaps = snapsRes.data || [];
  const uptime = snaps.length
    ? Math.round((snaps.filter(s => s.execution_status === "success").length / snaps.length) * 1000) / 10
    : null;

  const totalAlerts = alertsRes.count ?? 0;

  const resolved = resolvedRes.data || [];
  const avgResolveMinutes = resolved.length
    ? Math.round(
        resolved.reduce((sum, i) => {
          const mins = (new Date(i.resolved_at).getTime() - new Date(i.detected_at).getTime()) / 60000;
          return sum + mins;
        }, 0) / resolved.length
      )
    : null;

  // Common issues: group by category, badge by frequency + severity.
  const counts = new Map<string, { count: number; errorCount: number }>();
  (categoryRes.data || []).forEach(row => {
    const cat = row.category || "other";
    const entry = counts.get(cat) || { count: 0, errorCount: 0 };
    entry.count += 1;
    if (row.type === "error") entry.errorCount += 1;
    counts.set(cat, entry);
  });

  const commonIssues = [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([category, { count, errorCount }]) => ({
      label: CATEGORY_LABELS[category] || category,
      count,
      badge: errorCount > count / 2 ? "Critical" : count >= 5 ? "Frequent" : "Occasional",
    }));

  return NextResponse.json({
    windowDays: WINDOW_DAYS,
    uptime,
    totalAlerts,
    avgResolveMinutes,
    commonIssues,
  });
}