// ─────────────────────────────────────────────────────────────
// src/app/api/notifications/read-all/route.ts
// POST /api/notifications/read-all — mark every unread notification as read
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function POST() {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { error } = await db
    .from("flowlens_notifications")
    .update({ read: true })
    .eq("team_id", teamId)
    .eq("read", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}