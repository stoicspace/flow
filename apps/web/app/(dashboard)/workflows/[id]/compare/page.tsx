// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/workflows/[id]/compare/page.tsx
// Main visual compare page,wires everything together
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import type { WorkflowDiff, NormalisedWorkFlow } from "@flowlens/core";

const WorkflowGraph = dynamic(() => import("@/components/workflow/WorkFlowGraph"), { ssr: false });

import DiffLegend from "@/components/diff/DiffLegend";
import AIExplanationCard from "@/components/diff/AIExplanationCard";
import RecoveryControls from "@/components/diff/RecoveryControls";

interface Analysis {
  root_cause: string;
  confidence: number;
  impact_summary: string;
  suggested_fix: { description: string; node_id?: string; field?: string } | null;
}

// src/app/(dashboard)/workflows/[id]/compare/page.tsx
import { Suspense } from "react";

export default function ComparePageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-text-muted text-sm">Loading...</div>}>
      <ComparePage />
    </Suspense>
  );
}
function ComparePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const workflowId = params.id as string;
  const fromId = searchParams.get("from");
  const toId = searchParams.get("to");

  const [diff, setDiff] = useState<WorkflowDiff | null>(null);
  const [snapBefore, setSnapBefore] = useState<NormalisedWorkFlow | null>(null);
  const [snapAfter, setSnapAfter] = useState<NormalisedWorkFlow | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoredMessage, setRestoredMessage] = useState("");
  const [applyingFix, setApplyingFix] = useState(false);
  const [fixMessage, setFixMessage] = useState("");
  const [fixError, setFixError] = useState("");
  const [incidentId, setIncidentId] = useState<string | null>(null);

  useEffect(() => {
    if (!fromId || !toId) {
      setError("Missing snapshot IDs to compare.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [diffRes, snapARes, snapBRes] = await Promise.all([
          fetch(`/api/diff?from=${fromId}&to=${toId}`).then(r => r.json()),
          fetch(`/api/snapshots/${fromId}`).then(r => r.json()),
          fetch(`/api/snapshots/${toId}`).then(r => r.json()),
        ]);

        if (diffRes.error) throw new Error(diffRes.error);

        setDiff(diffRes.diff);
        setSnapBefore(snapARes.snapshot?.normalised || null);
        setSnapAfter(snapBRes.snapshot?.normalised || null);

        // Find or trigger AI analysis,look for an incident linking these snapshots
        const incidentsRes = await fetch(
          `/api/incidents?workflow_id=${workflowId}&status=open`
        ).then(r => r.json());

        const matchingIncident = incidentsRes.incidents?.find(
          (inc: { id: string; snapshot_before: string; snapshot_after: string }) =>
            inc.snapshot_before === fromId && inc.snapshot_after === toId
        );

        if (matchingIncident) {
          setIncidentId(matchingIncident.id);
          const analyseRes = await fetch(
            `/api/incidents/${matchingIncident.id}/analyse`,
            { method: "POST" }
          ).then(r => r.json());
          setAnalysis(analyseRes.analysis);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load comparison");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [fromId, toId, workflowId]);

  async function handleRestore() {
    if (!fromId) return;
    setRestoring(true);
    try {
      await fetch("/api/snapshots/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot_id: fromId, workflow_id: workflowId }),
      });
      setRestoredMessage("Workflow restored to last working version.");
      setTimeout(() => router.push(`/workflows/${workflowId}`), 1500);
    } catch {
      setError("Restore failed. Try again.");
    } finally {
      setRestoring(false);
    }
  }

  async function handleApplyFix() {
    setApplyingFix(true);
    setFixMessage("");
    setFixError("");
    try {
      // Reuse the real Fix Workflow pipeline (diagnose -> validate -> apply ->
      // test) instead of just flipping incident status with no actual change.
      const context = [analysis?.root_cause, analysis?.impact_summary]
        .filter(Boolean)
        .join(" — ");

      const proposeRes = await fetch(`/api/workflows/${workflowId}/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error_message: context || undefined,
          user_request: "Apply suggested fix from incident analysis",
        }),
      });
      const proposeData = await proposeRes.json();
      if (!proposeRes.ok) throw new Error(proposeData.error || "Diagnosis failed.");

      const attempt = proposeData.attempt;
      if (!attempt?.validation?.valid) {
        throw new Error(
          attempt?.validation?.errors?.join(" ") ||
          "The proposed fix did not pass validation. Open the workflow to review it manually."
        );
      }

      const applyRes = await fetch(
        `/api/workflows/${workflowId}/fix/${attempt.id}/apply`,
        { method: "POST" }
      );
      const applyData = await applyRes.json();
      if (!applyRes.ok) throw new Error(applyData.error || "Applying the fix failed.");

      if (applyData.test_result?.passed) {
        if (incidentId) {
          await fetch(`/api/incidents/${incidentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "resolved" }),
          });
        }
        setFixMessage("Fix applied and verified. Incident marked resolved.");
        setTimeout(() => router.push(`/workflows/${workflowId}`), 1500);
      } else {
        setFixMessage(
          "Fix applied but didn't fully verify — open the workflow's Fix Workflow panel to review and retry."
        );
      }
    } catch (e: unknown) {
      setFixError(e instanceof Error ? e.message : "Applying the fix failed.");
    } finally {
      setApplyingFix(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-text-muted text-sm">Loading comparison...</div>;
  }

  if (error) {
    return <div className="p-8 text-status-error text-sm">{error}</div>;
  }

  return (
    <div className="p-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Visual Compare</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Last working version vs current broken version
          </p>
        </div>
        <DiffLegend />
      </div>

      {/* Split graphs */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-text-muted mb-2 font-medium">Last working</p>
          {snapBefore ? (
            <WorkflowGraph workflow={snapBefore} diff={diff!} height={380} />
          ) : (
            <div className="h-[380px] bg-surface-2 rounded-lg border border-border flex items-center justify-center text-text-muted text-sm">
              No data
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-text-muted mb-2 font-medium">Current (broken)</p>
          {snapAfter ? (
            <WorkflowGraph workflow={snapAfter} diff={diff!} height={380} />
          ) : (
            <div className="h-[380px] bg-surface-2 rounded-lg border border-border flex items-center justify-center text-text-muted text-sm">
              No data
            </div>
          )}
        </div>
      </div>

      {/* Diff summary strip */}
      {diff && (
        <div className="flex items-center gap-6 bg-surface-2 border border-border rounded-lg px-4 py-3 mb-6 text-xs">
          <span className="text-status-success">{diff.summary.added} added</span>
          <span className="text-status-warning">{diff.summary.modified} modified</span>
          <span className="text-status-error">{diff.summary.removed} removed</span>
          {diff.edgesChanged && <span className="text-text-muted">Connections changed</span>}
        </div>
      )}

      {/* AI explanation */}
      {analysis ? (
        <div className="mb-6">
          <AIExplanationCard
            rootCause={analysis.root_cause}
            confidence={analysis.confidence}
            impactSummary={analysis.impact_summary}
            suggestedFix={analysis.suggested_fix}
            onApplyFix={analysis.suggested_fix ? handleApplyFix : undefined}
            applying={applyingFix}
          />
          {fixMessage && (
            <p className="text-xs text-status-success mt-2">{fixMessage}</p>
          )}
          {fixError && (
            <p className="text-xs text-status-error mt-2">{fixError}</p>
          )}
        </div>
      ) : (
        <div className="bg-surface-2 border border-border rounded-xl p-5 mb-6">
          <p className="text-sm text-text-muted">
            No AI analysis available for this comparison. This usually means no incident
            is linked to these snapshots yet.
          </p>
        </div>
      )}

      {/* Recovery controls */}
      <RecoveryControls
        onRestore={handleRestore}
        restoring={restoring}
        restoredMessage={restoredMessage}
      />

    </div>
  );
}