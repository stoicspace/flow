import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";

export async function GET(
  _req: Request,
{ params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const storage = new SupabaseStorageAdapter(db);
  const workflow = await storage.getWorkflow(teamId, (await params).id);

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }
  return NextResponse.json({ workflow });
}

export async function PATCH(
  request: Request,
{ params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const body = await request.json();
  const allowed = ["name", "status", "external_id"] as const;
  const updates: Record<string, unknown> = {};
  allowed.forEach(k => { if (k in body) updates[k] = body[k]; });

  try {
    const storage = new SupabaseStorageAdapter(db);
    const workflow = await storage.updateWorkflow(teamId, (await params).id, updates);
    return NextResponse.json({ workflow });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update workflow";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
{ params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  try {
    const storage = new SupabaseStorageAdapter(db);
    await storage.deleteWorkflow(teamId, (await params).id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete workflow";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


