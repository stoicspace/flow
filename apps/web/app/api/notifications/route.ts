// ─────────────────────────────────────────────────────────────
// src/app/api/notifications/route.ts
// GET /api/notifications?status=all|unread&type=error,warning
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all"; // "all" | "unread"
  const typeParam = searchParams.get("type"); // e.g. "error,warning"

  let query = db
    .from("flowlens_notifications")
    .select("*")
    .eq("team_id", teamId)
    .is("dismissed_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status === "unread") query = query.eq("read", false);
  if (typeParam) query = query.in("type", typeParam.split(","));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const unreadCount = (data || []).filter(n => !n.read).length;

  return NextResponse.json({ notifications: data ?? [], unreadCount });
}