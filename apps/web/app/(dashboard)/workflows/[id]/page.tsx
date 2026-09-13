

// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/workflows/[id]/page.tsx
// Main workflow detail page,wires everything together
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import type { NormalisedWorkFlow } from "@flowlens/core";
import {MessageCircleCode} from 'lucide-react';

const WorkflowGraph = dynamic(() => import("@/components/workflow/WorkFlowGraph"), { ssr: false });

import SnapshotTimeline from "@/components/workflow/SnapshotTimeline";
import AIInsightsPanel from "@/components/workflow/AIInsightsPanel";
import AIAssistantPanel from "@/components/assistant/AIAssistantPanel";
import AISummaryCard from "@/components/workflow/AISummaryCard";
import AIScoreCard from "@/components/workflow/AIScoreCard";
import DeploymentReadiness from "@/components/workflow/DeploymentReadiness";
import OptimizationPanel from "@/components/workflow/OptimizationPanel";
import WorkflowDocumentation from "@/components/workflow/WorkflowDocumentation";
import FixWorkflowPanel, { FixWorkflowPanelHandle } from "@/components/workflow/FixWorkflowPanel";
import { buildIncidentContext } from "@/components/assistant/IncidentBanner";

interface Snapshot {
  id: string;
  created_at: string;
  source: string;
  execution_status: string | null;
  error_message?: string | null;
  label?: string | null;
  ai_summary?: { summary: string; complexity?: "low" | "medium" | "high" } | null;
}

interface Workflow {
  id: string;
  name: string;
  platform: string;
  status: "healthy" | "degraded" | "failing" | "unknown";
}

interface WorkflowSummary {
  summary: string;
  complexity: "low" | "medium" | "high";
  node_count: number;
  risks: string[];
  optimization_opportunities: string[];
}

interface DeploymentCheck {
  score: number;
  status: "ready" | "needs_review" | "blocked";
  blocking_issues: string[];
  warnings: string[];
}

interface OptimizationOpportunity {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  node_id?: string;
}

interface WorkflowDoc {
  title: string;
  overview: string;
  sections: Array<{ heading: string; content: string }>;
  node_docs: Array<{ node_id: string; label: string; purpose: string }>;
}

export default function WorkflowDetailPage() {
  const params = useParams();
  const workflowId = params.id as string;
  const [showAssistant, setShowAssistant] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [aiUnavailableReason, setAiUnavailableReason] = useState<string | null>(null);
  const fixPanelRef = useRef<FixWorkflowPanelHandle>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>("");
  const [normalisedData, setNormalisedData] = useState<NormalisedWorkFlow | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Copilot state — summary/complexity/risks, deployment check, and
  // optimization/documentation (fetched on demand, not on every load, since
  // those two are heavier calls the person may not always need).
  const [aiSummary, setAiSummary] = useState<WorkflowSummary | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  const [deploymentCheck, setDeploymentCheck] = useState<DeploymentCheck | null>(null);
  const [deploymentLoading, setDeploymentLoading] = useState(false);

  const [optimizations, setOptimizations] = useState<OptimizationOpportunity[]>([]);
  const [optimizationsLoading, setOptimizationsLoading] = useState(false);

  const [documentation, setDocumentation] = useState<WorkflowDoc | null>(null);
  const [documentationLoading, setDocumentationLoading] = useState(false);

  // Load workflow + snapshots on mount
  const loadWorkflowAndSnapshots = useCallback(async () => {
    const [wfRes, snapRes] = await Promise.all([
      fetch(`/api/workflows/${workflowId}`).then(r => r.json()),
      fetch(`/api/snapshots?workflow_id=${workflowId}`).then(r => r.json()),
    ]);
    setWorkflow(wfRes.workflow);
    setSnapshots(snapRes.snapshots || []);
    if (snapRes.snapshots?.length > 0) {
      setSelectedSnapshotId(snapRes.snapshots[0].id);
    }
    setLoading(false);
  }, [workflowId]);

  useEffect(() => {
    loadWorkflowAndSnapshots();
  }, [loadWorkflowAndSnapshots]);

  // Load normalised graph data whenever selected snapshot changes
  useEffect(() => {
    if (!selectedSnapshotId) return;
    fetch(`/api/snapshots/${selectedSnapshotId}`)
      .then(r => r.json())
      .then(data => setNormalisedData(data.snapshot?.normalised || null));
  }, [selectedSnapshotId]);

  // Fetch the AI summary automatically whenever the selected snapshot
  // changes — this is the "understand the workflow" moment, so it's cheap
  // enough to always show. Deployment check / optimization / docs are
  // heavier and stay behind explicit buttons below.
  useEffect(() => {
    if (!selectedSnapshotId) return;
    let cancelled = false;
    setAiSummary(null);
    setDeploymentCheck(null);
    setOptimizations([]);
    setDocumentation(null);
    setAiSummaryLoading(true);
    setAiUnavailableReason(null);

    fetch("/api/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot_id: selectedSnapshotId }),
    })
      .then(async r => {
        const data = await r.json();
        if (!r.ok && !cancelled) setAiUnavailableReason(data.error || "AI summary is currently unavailable.");
        return data;
      })
      .then(data => {
        if (!cancelled) setAiSummary(data.summary || null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAiSummaryLoading(false);
      });
    runDeploymentCheck();
    runOptimizationScan();
    generateDocumentation();
    return () => {
      cancelled = true;
    };
  }, [selectedSnapshotId]);

  const runDeploymentCheck = useCallback(async () => {
    if (!selectedSnapshotId) return;
    setDeploymentLoading(true);
    try {
      const res = await fetch("/api/ai/deployment-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshot_id: selectedSnapshotId,
          compare_snapshot_id: snapshots[1]?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiUnavailableReason(data.error || "Deployment check is currently unavailable.");
        return;
      }
      setDeploymentCheck(data.check || null);
    } catch {
      // Network-level failure only — AI service functions already fail
      // safe and return a fallback shape for everything else.
    } finally {
      setDeploymentLoading(false);
    }
  }, [selectedSnapshotId, snapshots]);

  const runOptimizationScan = useCallback(async () => {
    if (!selectedSnapshotId) return;
    setOptimizationsLoading(true);
    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot_id: selectedSnapshotId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiUnavailableReason(data.error || "Optimization scan is currently unavailable.");
        return;
      }
      setOptimizations(data.optimization?.opportunities || []);
    } catch {
    } finally {
      setOptimizationsLoading(false);
    }
  }, [selectedSnapshotId]);

  const generateDocumentation = useCallback(async () => {
    if (!selectedSnapshotId) return;
    setDocumentationLoading(true);
    try {
      const res = await fetch("/api/ai/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot_id: selectedSnapshotId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiUnavailableReason(data.error || "Documentation generation is currently unavailable.");
        return;
      }
      setDocumentation(data.documentation || null);
    } catch {
    } finally {
      setDocumentationLoading(false);
    }
  }, [selectedSnapshotId]);

  const restoreSnapshot = useCallback(async () => {
    // "Restore" from chat restores to the snapshot before the current one —
    // same target the "Compare versions" link already uses (snapshots[1]).
    const target = snapshots[1];
    if (!target) {
      alert("No earlier snapshot to restore to yet.");
      return;
    }
    setRestoring(true);
    try {
      const res = await fetch("/api/snapshots/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot_id: target.id, workflow_id: workflowId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed.");
      await loadWorkflowAndSnapshots();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Restore failed.");
    } finally {
      setRestoring(false);
    }
  }, [snapshots, workflowId, loadWorkflowAndSnapshots]);

  const dependencies = normalisedData
    ? Array.from(new Set(
        normalisedData.nodes
          .map(n => n.credential_ref)
          .filter(Boolean) as string[]
      ))
    : [];

  const recentChanges = snapshots.slice(0, 4).map(s => ({
    label: s.label || `${s.source} snapshot`,
    time: new Date(s.created_at).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }),
  }));

  if (loading) {
    return <div className="p-8 text-text-muted text-sm">Loading workflow...</div>;
  }

  if (!workflow) {
    return <div className="p-8 text-status-error text-sm">Workflow not found.</div>;
  }

  return (
    <div className="flex h-full">

      {/* Timeline sidebar */}
      <SnapshotTimeline
        snapshots={snapshots}
        selectedId={selectedSnapshotId}
        onSelect={setSelectedSnapshotId}
      />

      {/* Main graph area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">{workflow.name}</h1>
            <p className="text-xs text-text-muted mt-0.5">
              {workflow.platform} · {snapshots.length} snapshots
            </p>
          </div>
          <a
            href={`/workflows/${workflowId}/compare?from=${snapshots[1]?.id || ""}&to=${selectedSnapshotId}`}
            className="text-xs bg-surface-2 border border-border rounded-lg px-4 py-2 text-text-muted hover:text-text-primary hover:border-brand-orange/40 transition-colors"
          >
            Compare versions
          </a>
          <button
            onClick={()=> setShowAssistant(true)}
            className="flex w items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-3 text-sm font-semibold text-text-primary transition hover:opacity-90"
          >
            <MessageCircleCode size={20} strokeWidth={2.5} />
            Ask FlowLens Copilot
          </button>
        </div>
        {/* Fix Workflow — diagnose, propose, validate, apply, test loop */}
        <FixWorkflowPanel
          ref={fixPanelRef}
          workflowId={workflowId}
          errorMessage={snapshots.find(s => s.id === selectedSnapshotId)?.error_message}
        />
        {/* AI Summary + Score strip — "understand this workflow" at a glance */}
         
        {normalisedData ? (
          <WorkflowGraph
            workflow={normalisedData}
            riskNodeIds={
              // Best-effort: match risk text against node labels so risky
              // nodes stand out on the graph without needing per-node IDs
              // from generateWorkflowSummary (which returns free-text risks).
              normalisedData.nodes
                .filter(n => (aiSummary?.risks || []).some(r => r.toLowerCase().includes(n.label.toLowerCase())))
                .map(n => n.id)
            }
          />
        ) : (
          <div className="h-96 flex items-center justify-center text-text-muted text-sm bg-surface-2 rounded-lg border border-border">
            No snapshot data available
          </div>
        )}

        

        {/* Deployment readiness + optimization — Review / Documentation / Optimization */}
      </div>

      {/* AI Insights panel */}
      {aiUnavailableReason && (
        <div className="bg-status-warning/10 border border-status-warning/30 rounded-lg px-4 py-2.5 mb-4 text-xs text-status-warning">
          {aiUnavailableReason}
        </div>
      )}
      <AIInsightsPanel
        workflowName={workflow.name}
        systemHealth={workflow.status}
        dependencies={dependencies}
        recentChanges={recentChanges}
        aiSummary={aiSummary?.summary}
        aiComplexity={aiSummary?.complexity}
        aiRisks={aiSummary?.risks}
        aiSummaryLoading={aiSummaryLoading}
        deploymentCheck={deploymentCheck}
        deploymentLoading={deploymentLoading}
        documentation={documentation}
        documentationLoading={documentationLoading}
        optimizations={optimizations}
        optimizationsLoading={optimizationsLoading}
      />
      {showAssistant && (
  <AIAssistantPanel
    workflowId={workflow.id}
    snapshotId={selectedSnapshotId}
    incidentContext={buildIncidentContext(workflow)}
    onClose={() => setShowAssistant(false)}
    onApplyFix={() => {
      // Doesn't blindly apply anything from chat — triggers a REAL
      // diagnosis on the same Fix Workflow panel the person reviews and
      // approves in, so the human-approval gate stays intact either way
      // they get here.
      setShowAssistant(false);
      fixPanelRef.current?.triggerDiagnosis();
      setTimeout(() => fixPanelRef.current?.scrollIntoView(), 100);
    }}
    onRestore={restoreSnapshot}
    onOpenCompare={() => {
      window.location.href = `/workflows/${workflow.id}/compare?from=${snapshots[1]?.id || ""}&to=${selectedSnapshotId}`;
    }}
  />
)}
      

    </div>
  );
} 
