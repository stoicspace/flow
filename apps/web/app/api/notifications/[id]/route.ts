// ─────────────────────────────────────────────────────────────
// src/app/api/notifications/[id]/route.ts
// PATCH /api/notifications/:id — { read?: boolean, dismissed?: boolean }
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { read, dismissed } = await request.json();

  const updates: Record<string, unknown> = {};
  if (typeof read === "boolean") updates.read = read;
  if (dismissed === true) updates.dismissed_at = new Date().toISOString();

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await db
    .from("flowlens_notifications")
    .update(updates)
    .eq("id", (await params).id)
    .eq("team_id", teamId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notification: data });
}