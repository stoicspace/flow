// src/app/api/webhooks/zapier/[teamId]/route.ts
//
// The user points Zapier's "Webhooks by Zapier" action at:
//   {NEXT_PUBLIC_APP_URL}/api/webhooks/zapier/{teamId}?secret={webhookSecret}
//
// This has no session — Zapier calls it server-to-server — so teamId +
// secret in the URL are the only auth. Use the service-role Supabase client
// here, not getAuthContext() (there's no logged-in user on this request).

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service"; // your service-role client, not the cookie-based one
import { ZapierWebhookPayload } from "@/lib/connections/zapier";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const db = createServiceClient();

  const secret = request.nextUrl.searchParams.get("secret");

  const { data: integration } = await db
    .from("flowlens_platforms")
    .select("*")
    .eq("team_id", teamId)
    .eq("platform", "zapier")
    .single();

  if (!integration || secret !== integration.webhook_secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: ZapierWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.zap_id || !payload.status || !payload.ran_at) {
    return NextResponse.json(
      { error: "Missing zap_id, status, or ran_at" },
      { status: 400 }
    );
  }

  const { data: workflow } = await db
    .from("flowlens_workflows")
    .upsert(
      {
        team_id: teamId,
        external_id: payload.zap_id,
        platform: "zapier",
        name: payload.zap_name || payload.zap_id,
        status: payload.status === "success" ? "healthy" : "failing",
        updated_at: new Date(),
      },
      { onConflict: "external_id" }
    )
    .select("id")
    .single();

  if (!workflow) {
    return NextResponse.json({ error: "Could not upsert workflow" }, { status: 500 });
  }

  await db.from("flowlens_snapshots").insert({
    workflow_id: workflow.id,
    team_id: teamId,
    source: "zapier",
    execution_status: payload.status,
    error_message: payload.error_message ?? null,
    raw: payload,
  });

  if (payload.status === "error") {
    const { data: existing } = await db
      .from("flowlens_incidents")
      .select("id")
      .eq("workflow_id", workflow.id)
      .eq("status", "open")
      .limit(1);

    if (!existing?.length) {
      await db.from("flowlens_incidents").insert({
        workflow_id: workflow.id,
        team_id: teamId,
        status: "open",
        detected_at: new Date(),
        error_message: payload.error_message ?? "Unknown error",
        impact_summary: "Zap run failed.",
        confidence: 0.9,
      });
    }
  } else {
    await db
      .from("flowlens_incidents")
      .update({ status: "resolved", resolved_at: new Date() })
      .eq("workflow_id", workflow.id)
      .eq("status", "open");
  }

  return NextResponse.json({ ok: true });
}