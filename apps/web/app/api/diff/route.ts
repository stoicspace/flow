
// ─────────────────────────────────────────────────────────────
// src/app/api/diff/route.ts
// GET /api/diff?from=snapshotId&to=snapshotId
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { diffWorkflows } from "@flowlens/core";
import { explainChange } from "@/lib/services/ai";
import { assertAiAllowed, getTeamAIProvider } from "@/lib/services/aiSettings";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to snapshot IDs are required" },
      { status: 400 }
    );
  }

  const [{ data: snapA }, { data: snapB }] = await Promise.all([
    db
      .from("flowlens_snapshots")
      .select("normalised")
      .eq("id", from)
      .eq("team_id", teamId)
      .single(),
    db
      .from("flowlens_snapshots")
      .select("normalised")
      .eq("id", to)
      .eq("team_id", teamId)
      .single(),
  ]);

  if (!snapA || !snapB) {
    return NextResponse.json({ error: "One or both snapshots not found" }, { status: 404 });
  }

  const diff = diffWorkflows(snapA.normalised, snapB.normalised);

  // Semantic AI explanation of the change — best-effort, never blocks the
  // raw diff from returning if the AI call fails, and skipped entirely if
  // the team has automatic AI processing turned off, since this runs on
  // every compare-page load rather than an explicit user request.
  let explanation = "";
  const gate = await assertAiAllowed(db, teamId, "automatic_review");
  if (gate.allowed) {
    try {
      const provider = await getTeamAIProvider(db, teamId);
      explanation = await explainChange(provider, diff);
    } catch (e) {
      console.error("explainChange failed in /api/diff:", e);
    }
  }

  return NextResponse.json({ diff, from, to, explanation });
}


