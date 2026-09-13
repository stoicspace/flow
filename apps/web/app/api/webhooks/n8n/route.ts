import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { normalise } from "@flowlens/core";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate webhook secret header
    const secret = request.headers.get("x-flowlens-secret");
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createServiceClient();
    const storage = new SupabaseStorageAdapter(db);

    // Find workflow by external n8n ID — no team known yet, so this is the
    // one deliberately unscoped lookup on StorageAdapter (see its
    // interface comment for why).
    const workflow = await storage.findWorkflowByExternalId(String(body.workflowId));

    if (!workflow) {
      // Not registered in FlowLens — ignore silently
      return NextResponse.json({ ok: true, ignored: true });
    }

    const teamId = workflow.team_id;
    const executionStatus = body.status === "error" ? "failure" : "success";

    // Normalise the workflow JSON attached to the webhook payload
    let normalised;
    try {
      normalised = normalise("n8n", body.workflow || body);
    } catch {
      return NextResponse.json({ error: "Could not normalise workflow" }, { status: 400 });
    }

    // Store snapshot — no created_by: there's no authenticated user on an
    // inbound webhook, and forcing a fake id risks violating a foreign key
    // to auth.users. The original route never set this column either.
    const snapshot = await storage.createSnapshot(teamId, {
      workflow_id: workflow.id,
      normalised,
      raw: body,
      source: "webhook",
      execution_status: executionStatus,
      error_message: body.error?.message || undefined,
    });

    if (executionStatus === "failure") {
      // Find last successful snapshot for comparison
      const lastGood = await storage.getLatestSuccessfulSnapshot(teamId, workflow.id);

      // Create incident
      await storage.createIncident(teamId, {
        workflow_id: workflow.id,
        snapshot_before: lastGood?.id,
        snapshot_after: snapshot.id,
        error_message: body.error?.message || undefined,
      });

      // Mark workflow as failing
      await storage.updateWorkflow(teamId, workflow.id, { status: "failing" });
    } else {
      // Mark workflow as healthy
      await storage.updateWorkflow(teamId, workflow.id, {
        status: "healthy",
        last_snapshot_at: new Date().toISOString(),
      });
    }

    // Always respond fast
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
