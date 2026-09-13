// ─────────────────────────────────────────────────────────────
// src/app/api/history/route.ts
// GET /api/history?workflow_id=xxx — change log for a workflow
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get("workflow_id");

  let query = db
    .from("change_log")
    .select("*, profiles(display_name)")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (workflowId) query = query.eq("workflow_id", workflowId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ history: data });
}


