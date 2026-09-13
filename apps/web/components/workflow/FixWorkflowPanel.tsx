// ─────────────────────────────────────────────────────────────
// src/components/workflow/FixWorkflowPanel.tsx
// The "Fix Workflow" MVP loop, in one card:
//   [Fix Workflow] -> Diagnosis + proposed operations + validation
//   -> [Review Changes] [Apply Fix] -> test result -> [Try Again] on failure
// Drives POST /api/workflows/:id/fix and .../fix/:attemptId/apply.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Wrench, CheckCircle2, XCircle, Loader2, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import type { RepairOperation, ValidationResult, FixTestResult } from "@flowlens/core";

interface FixAttempt {
  id: string;
  attempt_number: number;
  diagnosis: string | null;
  reason: string | null;
  operations: RepairOperation[];
  validation: ValidationResult | null;
  test_result: FixTestResult | null;
  status: "proposed" | "validated" | "applied" | "testing" | "success" | "failed";
}

interface Props {
  workflowId: string;
  errorMessage?: string | null;
}

// Exposed so callers outside this panel (e.g. the chat "Apply Fix" button)
// can trigger a real diagnosis on THIS panel instead of building a second,
// disconnected apply path — the person always reviews/approves here.
export interface FixWorkflowPanelHandle {
  triggerDiagnosis: () => void;
  scrollIntoView: () => void;
}

const OP_LABELS: Record<string, string> = {
  ADD_RETRY: "Add retry with backoff",
  ADD_TIMEOUT: "Add timeout",
  SET_CONFIG_FIELD: "Update configuration",
  ADD_ERROR_HANDLER: "Add error handler",
  FIX_DATA_MAPPING: "Fix data mapping",
};

function describeOp(op: RepairOperation): string {
  switch (op.type) {
    case "ADD_RETRY":
      return `${op.nodeId}: retry up to ${op.maxRetries} times (${op.backoff})`;
    case "ADD_TIMEOUT":
      return `${op.nodeId}: timeout after ${op.timeoutMs}ms`;
    case "SET_CONFIG_FIELD":
      return `${op.nodeId}: set "${op.field}" = ${JSON.stringify(op.value)}`;
    case "ADD_ERROR_HANDLER":
      return `${op.nodeId}: route failures to new "${op.handlerLabel}" node`;
    case "FIX_DATA_MAPPING":
      return `${op.nodeId}: map "${op.fromPath}" → "${op.toPath}"`;
    default:
      return op.nodeId;
  }
}

function FixWorkflowPanel({ workflowId, errorMessage }: Props, ref: React.Ref<FixWorkflowPanelHandle>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState<FixAttempt | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // No live n8n webhook wired up yet (see lib/connections/n8n.ts scope notes),
  // so real execution errors won't populate errorMessage automatically in
  // dev/testing. This lets you paste one in manually to test the loop.
  const [manualError, setManualError] = useState("");

  useImperativeHandle(ref, () => ({
    triggerDiagnosis: () => {
      if (!diagnosing) runDiagnosis();
    },
    scrollIntoView: () => {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  }));

  async function runDiagnosis(retryOf?: string) {
    setDiagnosing(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error_message: manualError.trim() || errorMessage || undefined,
          retry_of: retryOf,
          user_request: retryOf ? "Try again" : "Fix Workflow",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Diagnosis failed.");
      setAttempt(data.attempt);
      setExpanded(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong diagnosing this workflow.");
    } finally {
      setDiagnosing(false);
    }
  }

  async function applyFix() {
    if (!attempt) return;
    setApplying(true);
    setError(null);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/fix/${attempt.id}/apply`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Applying the fix failed.");
      setAttempt(data.attempt);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong applying this fix.");
    } finally {
      setApplying(false);
    }
  }

  const isValid = attempt?.validation?.valid;
  const isDone = attempt?.status === "success" || attempt?.status === "failed";

  return (
    <div ref={containerRef} className="bg-surface-2 border border-border rounded-xl px-5 py-4 scroll-mt-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Wrench size={14} className="text-brand-orange" />
          <p className="text-[11px] text-text-muted uppercase tracking-wide">Fix Workflow</p>
        </div>
        {!attempt && (
          <button
            onClick={() => runDiagnosis()}
            disabled={diagnosing}
            className="text-[11px] font-medium text-brand-orange hover:opacity-80 disabled:opacity-40 transition flex items-center gap-1"
          >
            {diagnosing ? <Loader2 size={12} className="animate-spin" /> : null}
            {diagnosing ? "Diagnosing..." : "Diagnose Workflow"}
          </button>
        )}
      </div>

      {!attempt && !diagnosing && (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-text-muted">
            Let FlowLens diagnose the last failure and propose a safe, reviewable fix.
          </p>
          {!errorMessage && (
            <textarea
              value={manualError}
              onChange={e => setManualError(e.target.value)}
              placeholder="No execution error on file yet. Paste one here to test the fix loop (e.g. a Stripe 429 error), or leave blank to let FlowLens infer reliability gaps."
              rows={2}
              className="w-full text-[11px] bg-surface border border-border rounded-md px-2.5 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-orange/40 resize-none"
            />
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-status-error mt-2">{error}</p>
      )}

      {attempt && (
        <div className="mt-3 space-y-3">
          {/* Diagnosis */}
          <div className="bg-surface border border-border rounded-lg px-3.5 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-text-primary">
                  {attempt.diagnosis || "Diagnosis unavailable."}
                </p>
                {attempt.reason && (
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{attempt.reason}</p>
                )}
              </div>
              <button onClick={() => setExpanded(v => !v)} className="text-text-muted shrink-0">
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {expanded && (
              <>
                {/* Proposed operations */}
                <div className="mt-3 space-y-1.5">
                  {attempt.operations.map((op, i) => (
                    <div key={i} className="text-[11px] text-text-muted flex gap-2">
                      <span className="text-brand-orange shrink-0">{OP_LABELS[op.type] || op.type}</span>
                      <span>{describeOp(op)}</span>
                    </div>
                  ))}
                </div>

                {/* Validation */}
                <div className="mt-3 flex items-center gap-1.5">
                  {isValid ? (
                    <CheckCircle2 size={13} className="text-status-success" />
                  ) : (
                    <XCircle size={13} className="text-status-error" />
                  )}
                  <span className={`text-[11px] ${isValid ? "text-status-success" : "text-status-error"}`}>
                    {isValid ? "Validation passed" : "Validation failed"}
                  </span>
                </div>
                {!isValid && attempt.validation?.errors && (
                  <ul className="mt-1 space-y-0.5">
                    {attempt.validation.errors.map((e, i) => (
                      <li key={i} className="text-[11px] text-status-error">• {e}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {/* Test result, once applied */}
          {attempt.test_result && (
            <div className="bg-surface border border-border rounded-lg px-3.5 py-3">
              <div className="flex items-center gap-1.5">
                {attempt.test_result.passed ? (
                  <CheckCircle2 size={13} className="text-status-success" />
                ) : (
                  <XCircle size={13} className="text-status-error" />
                )}
                <span className={`text-[11px] font-medium ${attempt.test_result.passed ? "text-status-success" : "text-status-error"}`}>
                  {attempt.test_result.passed ? "Fix successful" : "Fix did not fully apply"}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">{attempt.test_result.message}</p>
              <ul className="mt-2 space-y-0.5">
                {attempt.test_result.checks.map((c, i) => (
                  <li key={i} className={`text-[11px] flex gap-1.5 ${c.passed ? "text-text-muted" : "text-status-error"}`}>
                    <span>{c.passed ? "✓" : "✕"}</span>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isDone && (
              <button
                onClick={applyFix}
                disabled={!isValid || applying}
                className="text-[11px] font-medium bg-brand-orange text-white rounded-md px-3 py-1.5 disabled:opacity-40 transition flex items-center gap-1"
              >
                {applying ? <Loader2 size={12} className="animate-spin" /> : null}
                {applying ? "Applying..." : "Apply Fix"}
              </button>
            )}
            {attempt.status === "failed" && (
              <button
                onClick={() => runDiagnosis(attempt.id)}
                disabled={diagnosing}
                className="text-[11px] font-medium border border-border text-text-primary rounded-md px-3 py-1.5 disabled:opacity-40 transition flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Try Again
              </button>
            )}
            {attempt.status === "success" && (
              <button
                onClick={() => setAttempt(null)}
                className="text-[11px] text-text-muted hover:text-text-primary transition"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default forwardRef(FixWorkflowPanel);
