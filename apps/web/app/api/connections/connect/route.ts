// src/app/api/integrations/connect/route.ts
// Full replacement — merges your existing n8n logic with make/zapier branches.

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { testN8nConnection, getN8nWorkflows } from "@/lib/connections/n8n";
import { testMakeConnection, getMakeScenarios } from "@/lib/connections/make";
import { generateWebhookSecret, buildZapierWebhookUrl } from "@/lib/connections/zapier";
import { encrypt } from "@/lib/services/crypto";

export async function POST(request: Request) {
  try {
    const ctx = await getAuthContext();
    if (ctx.error) return ctx.error;
    const { db, user } = ctx;

    const { platform, name, baseUrl, apiKey, makeTeamId } = await request.json();

    if (!platform || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // baseUrl/apiKey are required for n8n and make, not for zapier
    if (platform !== "zapier" && (!baseUrl || !apiKey)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (platform === "make" && !makeTeamId) {
      return NextResponse.json({ error: "Make team ID is required" }, { status: 400 });
    }

    const { data: profile } = await db
      .from("flowlens_profiles")
      .select("team_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // --- test connection (nothing to test for zapier, it's push-based) ---
    if (platform === "n8n") {
      await testN8nConnection(baseUrl, apiKey);
    } else if (platform === "make") {
      await testMakeConnection(baseUrl, apiKey, makeTeamId);
    }

    const webhookSecret = platform === "zapier" ? generateWebhookSecret() : null;

    // --- save the connection ---
    const { data: integration, error } = await db
      .from("flowlens_platforms")
      .insert({
        team_id: profile.team_id,
        platform,
        name,
        base_url: platform === "zapier" ? null : baseUrl,
        api_key: platform === "zapier" ? null : encrypt(apiKey),
        external_team_id: platform === "make" ? makeTeamId : null,
        webhook_secret: webhookSecret,
        status: "connected",
        last_sync: new Date(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // --- import workflows up front (n8n, make only — zapier workflows appear lazily via webhook) ---
    if (platform === "n8n") {
      const workflows = await getN8nWorkflows(baseUrl, apiKey);

      const rows = workflows.map((workflow) => ({
        team_id: profile.team_id,
        external_id: workflow.id,
        platform: "n8n",
        name: workflow.name,
        status: workflow.active ? "healthy" : "unknown",
      }));

      if (rows.length > 0) {
        await db.from("flowlens_workflows").upsert(rows, { onConflict: "external_id" });
      }
    } else if (platform === "make") {
      const scenarios = await getMakeScenarios(baseUrl, apiKey, makeTeamId);

      const rows = scenarios.map((s) => ({
        team_id: profile.team_id,
        external_id: String(s.id),
        platform: "make",
        name: s.name,
        status: s.isActive ? "healthy" : "unknown",
      }));

      if (rows.length > 0) {
        const { error: upsertError } = await db
          .from("flowlens_workflows")
          .upsert(rows, { onConflict: "external_id" });

        if (upsertError) throw upsertError;
      }
    }

    return NextResponse.json({
      success: true,
      integration,
      webhookUrl:
        platform === "zapier"
          ? buildZapierWebhookUrl(profile.team_id, webhookSecret!)
          : undefined,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Connection failed" },
      { status: 500 }
    );
  }
}
