// ─────────────────────────────────────────────────────────────
// src/app/api/workflows/[id]/fix/[attemptId]/apply/route.ts
// POST — apply a validated fix attempt: create a modified snapshot, run the
//   structural test step, and record success/failure. This is the human
//   approval gate the doc calls for — nothing here runs until the person
//   clicks "Apply Fix" on an already-validated proposal.
// ─────────────────────────────────────────────────────────────

import { NextResponse, NextRequest } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { applyOperations, testRepair } from "@flowlens/core";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";
import type { NormalisedWorkFlow, RepairOperation } from "@flowlens/core";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, teamId, db } = ctx;
  const { id: workflowId, attemptId } = await params;

  const storage = new SupabaseStorageAdapter(db);
  const attempt = await storage.getFixAttempt(teamId, workflowId, attemptId);

  if (!attempt) {
    return NextResponse.json({ error: "Fix attempt not found" }, { status: 404 });
  }

  const validation = attempt.validation as { valid: boolean } | null;
  if (!validation?.valid) {
    return NextResponse.json(
      { error: "This fix attempt did not pass validation and cannot be applied." },
      { status: 400 }
    );
  }

  if (attempt.status === "success" || attempt.status === "failed") {
    return NextResponse.json(
      { error: "This fix attempt has already been applied and tested." },
      { status: 400 }
    );
  }

  const baseSnapshot = attempt.base_snapshot_id
    ? await storage.getSnapshot(teamId, attempt.base_snapshot_id)
    : null;
  if (!baseSnapshot?.normalised) {
    return NextResponse.json({ error: "Base snapshot for this attempt is missing." }, { status: 400 });
  }

  const operations = attempt.operations as RepairOperation[];

  // 1. Apply — never mutate the base snapshot, always produce a new one.
  const fixedWorkflow = applyOperations(baseSnapshot.normalised as NormalisedWorkFlow, operations);

  let resultSnapshot;
  try {
    resultSnapshot = await storage.createSnapshot(teamId, {
      workflow_id: workflowId,
      normalised: fixedWorkflow,
      raw: baseSnapshot.raw,
      source: "ai_fix",
      label: `AI fix: ${attempt.diagnosis?.slice(0, 80) || "workflow repair"}`,
      created_by: user.id,
      execution_status: "unknown",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create result snapshot";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // 2. Test — structural verification (see repairTest.ts for scope notes).
  const testResult = testRepair(fixedWorkflow, operations);
  const finalStatus = testResult.passed ? "success" : "failed";

  let updatedAttempt;
  try {
    updatedAttempt = await storage.updateFixAttempt(teamId, attemptId, {
      result_snapshot_id: resultSnapshot.id,
      test_result: testResult,
      status: finalStatus,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update fix attempt";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // 3. On success, reflect it on the workflow + audit trail. On failure we
  //    leave workflow status alone — the person can retry or investigate.
  if (testResult.passed) {
    await storage.updateWorkflow(teamId, workflowId, { status: "healthy" });
  }

  await storage.createAuditLogEntry(teamId, {
    workflow_id: workflowId,
    snapshot_id: resultSnapshot.id,
    actor_id: user.id,
    actor_type: "ai",
    action: testResult.passed ? "ai_fix_applied_success" : "ai_fix_applied_failed",
  });

  return NextResponse.json({ attempt: updatedAttempt, snapshot: resultSnapshot, test_result: testResult });
}
