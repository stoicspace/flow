// ─────────────────────────────────────────────────────────────
// src/app/api/search/route.ts
// GET /api/search?q=where+is+stripe+used — semantic workflow search
//
// v1 implementation: no vector store. Pulls each workflow's latest snapshot
// and hands the whole index to the model in one call. Fine for small/medium
// teams; swap in embeddings + a vector store (pgvector, Pinecone, etc.) once
// workflow count grows — the route contract (GET ?q=... -> { answer, matches })
// can stay the same.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { answerWorkflowQuery, SearchableWorkflow } from "@/lib/services/ai";
import { assertAiAllowed, getTeamAIProvider } from "@/lib/services/aiSettings";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";
import type { NormalisedWorkFlow } from "@flowlens/core";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const gate = await assertAiAllowed(db, teamId, "analysis");
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || !query.trim()) {
    return NextResponse.json({ error: "q query param is required" }, { status: 400 });
  }

  const storage = new SupabaseStorageAdapter(db);
  const workflows = await storage.listWorkflows(teamId);

  if (workflows.length === 0) {
    return NextResponse.json({ answer: "No workflows to search yet.", matches: [] });
  }

  // Pull the latest snapshot per workflow. Simple N+1 for v1 — fine at small
  // scale, worth a single joined query once this is production-critical.
  const searchable: SearchableWorkflow[] = [];
  for (const wf of workflows) {
    const latest = await storage.getLatestSnapshot(teamId, wf.id);
    const nodes = (latest?.normalised as NormalisedWorkFlow | undefined)?.nodes || [];
    searchable.push({
      id: wf.id,
      name: wf.name,
      platform: wf.platform,
      nodes: nodes.map((n: { id: string; type: string; label: string; credential_ref?: string }) => ({
        id: n.id,
        type: n.type,
        label: n.label,
        credential_ref: n.credential_ref,
      })),
    });
  }

  try {
    const provider = await getTeamAIProvider(db, teamId);
    const result = await answerWorkflowQuery(provider, query, searchable);
    return NextResponse.json(result);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Search failed." }, { status: 500 });
  }
}
