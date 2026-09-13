// src/app/api/connections/sync/route.ts
// REPLACES your current file entirely.

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import {
  getN8nWorkflows,
  getN8nExecutions,
  normalizeN8nStatus,
} from "@/lib/connections/n8n";
import {
  getMakeScenarios,
  getMakeScenarioLogs,
  normalizeMakeStatus,
} from "@/lib/connections/make";
import { decrypt } from "@/lib/services/crypto";

export async function POST() {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { db, teamId } = ctx;

  const { data: integrations, error } = await db
    .from("flowlens_platforms")
    .select("*")
    .eq("status", "connected")
    .eq("team_id", teamId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let workflowsImported = 0;
  let executionsProcessed = 0;
  let incidentsCreated = 0;
  let incidentsResolved = 0;

  for (const integration of integrations) {
    try {
      if (integration.platform === "n8n") {
        const result = await syncN8n(db, integration);
        workflowsImported += result.workflowsImported;
        executionsProcessed += result.executionsProcessed;
        incidentsCreated += result.incidentsCreated;
        incidentsResolved += result.incidentsResolved;
      } else if (integration.platform === "make") {
        const result = await syncMake(db, integration);
        workflowsImported += result.workflowsImported;
        executionsProcessed += result.executionsProcessed;
        incidentsCreated += result.incidentsCreated;
        incidentsResolved += result.incidentsResolved;
      }
      // "zapier" is intentionally skipped here — it's push-based via
      // /api/webhooks/zapier/[teamId], not polled.

      await db
        .from("flowlens_platforms")
        .update({ last_sync: new Date(), status: "connected" })
        .eq("id", integration.id);
    } catch {
      await db
        .from("flowlens_platforms")
        .update({ status: "error" })
        .eq("id", integration.id);
    }
  }

  return NextResponse.json({
    success: true,
    workflowsImported,
    executionsProcessed,
    incidentsCreated,
    incidentsResolved,
  });
}

// --- helpers ---

async function upsertWorkflow(
  db: any,
  teamId: string,
  platform: string,
  externalId: string,
  name: string,
  status: string
) {
  const { data } = await db
    .from("flowlens_workflows")
    .upsert(
      {
        team_id: teamId,
        external_id: externalId,
        platform,
        name,
        status,
        updated_at: new Date(),
      },
      // NOTE: this matches your current onConflict: "external_id" behavior.
      // Once you add a composite unique constraint on
      // (team_id, platform, external_id), change this to:
      // onConflict: "team_id,platform,external_id"
      { onConflict: "external_id" }
    )
    .select("id")
    .single();

  return data?.id as string | undefined;
}

async function recordExecution(
  db: any,
  teamId: string,
  workflowId: string,
  platform: string,
  status: "success" | "error",
  errorMessage: string | null,
  raw: unknown
) {
  await db.from("flowlens_snapshots").insert({
    workflow_id: workflowId,
    team_id: teamId,
    source: platform,
    execution_status: status,
    error_message: errorMessage,
    raw,
  });

  await db
    .from("flowlens_workflows")
    .update({ status: status === "success" ? "healthy" : "failing" })
    .eq("id", workflowId);

  if (status === "error") {
    const { data: existing } = await db
      .from("flowlens_incidents")
      .select("id")
      .eq("workflow_id", workflowId)
      .eq("status", "open")
      .limit(1);

    if (!existing?.length) {
      await db.from("flowlens_incidents").insert({
        workflow_id: workflowId,
        team_id: teamId,
        status: "open",
        detected_at: new Date(),
        error_message: errorMessage ?? "Unknown error",
        impact_summary: "Workflow execution failed.",
        confidence: 0.98,
      });
      return { created: 1, resolved: 0 };
    }
    return { created: 0, resolved: 0 };
  }

  const { data: resolved } = await db
    .from("flowlens_incidents")
    .update({ status: "resolved", resolved_at: new Date() })
    .eq("workflow_id", workflowId)
    .eq("status", "open")
    .select("id");

  return { created: 0, resolved: resolved?.length ?? 0 };
}

async function syncN8n(db: any, integration: any) {
  let workflowsImported = 0;
  let executionsProcessed = 0;
  let incidentsCreated = 0;
  let incidentsResolved = 0;

  const apiKey = decrypt(integration.api_key);
  const workflows = await getN8nWorkflows(integration.base_url, apiKey);
  const workflowIdByExternalId = new Map<string, string>();

  for (const wf of workflows) {
    const id = await upsertWorkflow(
      db,
      integration.team_id,
      "n8n",
      wf.id,
      wf.name,
      wf.active ? "healthy" : "unknown"
    );
    if (id) workflowIdByExternalId.set(wf.id, id);
    workflowsImported++;
  }

  const executions = await getN8nExecutions(integration.base_url, apiKey);

  for (const ex of executions) {
    const workflowId = workflowIdByExternalId.get(ex.workflowId);
    if (!workflowId) continue;

    const status = normalizeN8nStatus(ex);
    if (status === "running") continue; // don't create snapshots for in-flight runs

    const result = await recordExecution(
      db,
      integration.team_id,
      workflowId,
      "n8n",
      status,
      ex.data?.resultData?.error?.message ?? null,
      ex
    );
    incidentsCreated += result.created;
    incidentsResolved += result.resolved;
    executionsProcessed++;
  }

  return { workflowsImported, executionsProcessed, incidentsCreated, incidentsResolved };
}

async function syncMake(db: any, integration: any) {
  let workflowsImported = 0;
  let executionsProcessed = 0;
  let incidentsCreated = 0;
  let incidentsResolved = 0;

  const apiKey = decrypt(integration.api_key);
  const scenarios = await getMakeScenarios(
    integration.base_url,
    apiKey,
    integration.external_team_id
  );
  const workflowIdByExternalId = new Map<string, string>();

  for (const sc of scenarios) {
    const id = await upsertWorkflow(
      db,
      integration.team_id,
      "make",
      String(sc.id),
      sc.name,
      sc.isActive ? "healthy" : ""
    );
    if (id) workflowIdByExternalId.set(String(sc.id), id);
    workflowsImported++;
  }

  for (const sc of scenarios) {
    const workflowId = workflowIdByExternalId.get(String(sc.id));
    if (!workflowId) continue;

    const logs = await getMakeScenarioLogs(integration.base_url, apiKey, sc.id);

    for (const log of logs) {
      const status = normalizeMakeStatus(log.status);
      const result = await recordExecution(
        db,
        integration.team_id,
        workflowId,
        "make",
        status,
        status === "error" ? "Scenario execution failed" : null,
        log
      );
      incidentsCreated += result.created;
      incidentsResolved += result.resolved;
      executionsProcessed++;
    }
  }

  return { workflowsImported, executionsProcessed, incidentsCreated, incidentsResolved };
}
