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
  const incident = await storage.getIncident(teamId, (await params).id);

  if (!incident) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }
  return NextResponse.json({ incident });
}

export async function PATCH(
  request: Request,
{ params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { status } = await request.json();
  const allowed = ["open", "resolved", "dismissed"];

  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updates: { status: typeof status; resolved_at?: string } = { status };
  if (status === "resolved") updates.resolved_at = new Date().toISOString();

  try {
    const storage = new SupabaseStorageAdapter(db);
    const incident = await storage.updateIncident(teamId, (await params).id, updates);
    return NextResponse.json({ incident });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update incident";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
