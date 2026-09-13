// ─────────────────────────────────────────────────────────────
// src/app/api/ai/optimize/route.ts
// POST /api/ai/optimize — structured optimization opportunities
// Body: { snapshot_id: string }
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { optimizeWorkflow } from "@/lib/services/ai";
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
    const optimization = await optimizeWorkflow(provider, snapshot.normalised as NormalisedWorkFlow);
    return NextResponse.json({ optimization, workflow_id: snapshot.workflow_id });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Optimization failed." }, { status: 500 });
  }
}
