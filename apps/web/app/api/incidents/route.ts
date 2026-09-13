import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";
import type { IncidentFilter } from "@flowlens/core";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get("workflow_id");
  const status = (searchParams.get("status") || "open") as IncidentFilter["status"];

  try {
    const storage = new SupabaseStorageAdapter(db);
    const incidents = await storage.listIncidents(teamId, {
      status,
      workflowId: workflowId || undefined,
    });
    return NextResponse.json({ incidents });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list incidents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
