// ─────────────────────────────────────────────────────────────
// src/app/api/team/route.ts
// PATCH /api/team — update the caller's team (workspace) name.
// Didn't exist before — added so ProfileSettings' workspace-name field
// has somewhere real to save to, matching the auth pattern used by
// /api/profile.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function PATCH(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { name } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
  }

  const { data, error } = await db
    .from("flowlens_teams")
    .update({ name: name.trim() })
    .eq("id", teamId)
    .select("id, name")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ team: data });
}
