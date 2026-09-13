import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, teamId, db } = ctx;

  const { snapshot_id, workflow_id } = await request.json();

  if (!snapshot_id || !workflow_id) {
    return NextResponse.json(
      { error: "snapshot_id and workflow_id required" },
      { status: 400 }
    );
  }

  const storage = new SupabaseStorageAdapter(db);

  const original = await storage.getSnapshot(teamId, snapshot_id);
  if (!original) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }

  // Create a new snapshot cloned from the original (restore = new snapshot)
  let restored;
  try {
    restored = await storage.createSnapshot(teamId, {
      workflow_id,
      normalised: original.normalised,
      raw: original.raw,
      source: "manual",
      label: `Restored from ${snapshot_id}`,
      created_by: user.id,
      execution_status: "unknown",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to restore snapshot";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Update workflow status back to healthy
  await storage.updateWorkflow(teamId, workflow_id, { status: "healthy" });

  // Log it
  await storage.createAuditLogEntry(teamId, {
    workflow_id,
    snapshot_id: restored.id,
    actor_id: user.id,
    actor_type: "user",
    action: "restored",
  });

  return NextResponse.json({ snapshot: restored }, { status: 201 });
}

