// ─────────────────────────────────────────────────────────────
// src/app/api/workflows/[id]/fix/route.ts
// POST /api/workflows/:id/fix — diagnose a broken workflow and propose a
//   structured, validated fix. Does NOT apply anything yet — this is the
//   "Diagnose Issue -> Generate Fix -> Structured Operations -> Validator"
//   half of the loop. See ./[attemptId]/apply for the apply+test half.
// GET  /api/workflows/:id/fix — list past fix attempts for this workflow.
// ─────────────────────────────────────────────────────────────

import { NextResponse, NextRequest } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { generateRepairFix } from "@/lib/services/ai";
import { validateOperations, normalizeOperations } from "@flowlens/core";
import { assertAiAllowed, getTeamAIProvider } from "@/lib/services/aiSettings";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";
import type { RepairOperation, NormalisedWorkFlow } from "@flowlens/core";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;
  const { id } = await params;

  try {
    const storage = new SupabaseStorageAdapter(db);
    const attempts = await storage.listFixAttempts(teamId, id, 20);
    return NextResponse.json({ attempts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list fix attempts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, teamId, db } = ctx;
  const { id: workflowId } = await params;

  const gate = await assertAiAllowed(db, teamId, "fix");
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { error_message, retry_of, user_request } = body as {
    error_message?: string;
    retry_of?: string;
    user_request?: string;
  };

  const storage = new SupabaseStorageAdapter(db);

  // 1. Load the workflow + its latest snapshot (the thing we're fixing).
  const workflow = await storage.getWorkflow(teamId, workflowId);
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const latestSnapshot = await storage.getLatestSnapshot(teamId, workflowId);
  if (!latestSnapshot?.normalised) {
    return NextResponse.json(
      { error: "No snapshot found for this workflow yet — import it first." },
      { status: 400 }
    );
  }

  const effectiveError = error_message || latestSnapshot.error_message || undefined;

  // 2. If this is a retry, pull prior attempts on this workflow so the AI
  //    doesn't propose the same fix twice.
  let attemptNumber = 1;
  let previousAttempts: Array<{ diagnosis: string; operations: RepairOperation[]; test_result: unknown }> = [];

  const priorAttempts = await storage.listFixAttempts(teamId, workflowId, 5);

  if (priorAttempts.length > 0) {
    // Don't assume list order corresponds to attempt_number order — compute
    // the max explicitly so this is correct regardless of how the adapter
    // sorts (listFixAttempts sorts by created_at, not attempt_number).
    attemptNumber = Math.max(...priorAttempts.map(a => a.attempt_number || 1)) + 1;
    previousAttempts = priorAttempts.map(a => ({
      diagnosis: a.diagnosis || "",
      operations: (a.operations || []) as unknown as RepairOperation[],
      test_result: a.test_result,
    }));
  }

  // 3. Diagnose + propose (AI Provider step).
  const provider = await getTeamAIProvider(db, teamId);
  const suggestion = await generateRepairFix(
    provider,
    latestSnapshot.normalised as NormalisedWorkFlow,
    effectiveError,
    previousAttempts
  );

  // 4. Normalize (self-heal trivially derivable fields like handlerNodeId)
  //    then validate (Validator step) before storing this as actionable.
  const normalizedOps = normalizeOperations(latestSnapshot.normalised as NormalisedWorkFlow, suggestion.operations);
  const validation = validateOperations(latestSnapshot.normalised as NormalisedWorkFlow, normalizedOps);

  // 5. Persist the proposal for review / audit / retry-chaining.
  try {
    const attempt = await storage.createFixAttempt(teamId, {
      workflow_id: workflowId,
      base_snapshot_id: latestSnapshot.id,
      attempt_number: attemptNumber,
      retry_of: retry_of || undefined,
      user_request: user_request || "Fix Workflow",
      error_message: effectiveError || undefined,
      diagnosis: suggestion.diagnosis,
      reason: suggestion.reason,
      operations: normalizedOps,
      validation,
      status: validation.valid ? "validated" : "proposed",
      created_by: user.id,
    });
    return NextResponse.json({ attempt }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to store fix attempt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
