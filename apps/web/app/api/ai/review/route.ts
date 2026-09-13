// ─────────────────────────────────────────────────────────────
// src/app/api/ai/review/route.ts
// POST /api/ai/review — AI Workflow Copilot review (findings + severity)
// Body: { snapshot_id: string }
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { reviewWorkflow } from "@/lib/services/ai";
import { assertAiAllowed, getTeamAIProvider } from "@/lib/services/aiSettings";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";
import type { NormalisedWorkFlow } from "@flowlens/core";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const gate = await assertAiAllowed(db, teamId, "analysis");
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const { snapshot_id } = await request.json();

  if (!snapshot_id) {
    return NextResponse.json({ error: "snapshot_id is required" }, { status: 400 });
  }

  const storage = new SupabaseStorageAdapter(db);
  const snapshot = await storage.getSnapshot(teamId, snapshot_id);

  if (!snapshot) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }

  try {
    const provider = await getTeamAIProvider(db, teamId);
    const review = await reviewWorkflow(provider, snapshot.normalised as NormalisedWorkFlow);

    // Best-effort persistence so the dashboard's "Recent Workflow Reviews"
    // and "AI Findings" widgets have something to read without re-running
    // AI on every page load. Safe no-op if the column doesn't exist yet.
    try {
      await storage.updateSnapshot(teamId, snapshot.id, { ai_review: review });
    } catch (persistErr) {
      console.error("Persisting ai_review failed (column may not exist yet):", persistErr);
    }

    return NextResponse.json({ review, workflow_id: snapshot.workflow_id });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Review failed." }, { status: 500 });
  }
}
