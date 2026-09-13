import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { normalise, detectPlatform } from "@flowlens/core";
import { generateWorkflowSummary } from "@/lib/services/ai";
import { assertAiAllowed, getTeamAIProvider } from "@/lib/services/aiSettings";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, teamId, db } = ctx;

  const { workflow_id, platform: explicitPlatform, raw_json, label } =
    await request.json();

  if (!workflow_id || !raw_json) {
    return NextResponse.json(
      { error: "workflow_id and raw_json are required" },
      { status: 400 }
    );
  }

  const platform = explicitPlatform || detectPlatform(raw_json);
  if (platform === "unknown") {
    return NextResponse.json(
      { error: "Could not detect workflow platform. Specify platform manually." },
      { status: 400 }
    );
  }

  let normalised;
  try {
    normalised = normalise(platform, raw_json);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to normalise workflow." }, { status: 400 });
  }

  const storage = new SupabaseStorageAdapter(db);
  let snapshot;
  try {
    snapshot = await storage.createSnapshot(teamId, {
      workflow_id,
      normalised,
      raw: raw_json,
      source: "import",
      label: label || undefined,
      created_by: user.id,
      execution_status: "unknown",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to store snapshot";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Update workflow last_snapshot_at
  await storage.updateWorkflow(teamId, workflow_id, {
    last_snapshot_at: new Date().toISOString(),
    status: "healthy",
  });

  // Log it
  await storage.createAuditLogEntry(teamId, {
    workflow_id,
    snapshot_id: snapshot.id,
    actor_id: user.id,
    actor_type: "user",
    action: "snapshot_created",
  });

  // Kick off the AI Copilot summary immediately after import so the person
  // sees "18 nodes, medium complexity, 2 deployment risks" instead of just
  // "Workflow imported." Best-effort — import still succeeds if this fails,
  // and it's skipped entirely (silently, not an import error) if the team
  // has "Automatic reviews" turned off — this IS the automatic-trigger case
  // that setting exists for, since nobody explicitly asked for AI here.
  let ai_summary = null;
  const gate = await assertAiAllowed(db, teamId, "automatic_review");
  if (gate.allowed) {
    try {
      const provider = await getTeamAIProvider(db, teamId);
      ai_summary = await generateWorkflowSummary(provider, normalised);
      await storage.updateSnapshot(teamId, snapshot.id, { ai_summary });
    } catch (e) {
      console.error("Post-import AI summary failed:", e);
    }
  }

  return NextResponse.json({ snapshot, ai_summary }, { status: 201 });
}
