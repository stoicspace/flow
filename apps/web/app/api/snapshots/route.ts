import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get("workflow_id");

  if (!workflowId) {
    return NextResponse.json({ error: "workflow_id is required" }, { status: 400 });
  }

  try {
    const storage = new SupabaseStorageAdapter(db);
    const snapshots = await storage.listSnapshots(teamId, workflowId, 50);
    return NextResponse.json({ snapshots });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list snapshots";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
