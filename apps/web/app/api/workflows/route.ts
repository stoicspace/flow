
import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  try {
    const storage = new SupabaseStorageAdapter(db);
    const workflows = await storage.listWorkflows(teamId);
    return NextResponse.json({ workflows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list workflows";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { name, platform, external_id } = await request.json();

  if (!name || !platform) {
    return NextResponse.json(
      { error: "name and platform are required" },
      { status: 400 }
    );
  }

  try {
    const storage = new SupabaseStorageAdapter(db);
    const workflow = await storage.createWorkflow(teamId, { name, platform, external_id });
    return NextResponse.json({ workflow }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create workflow";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


