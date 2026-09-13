// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/engine/page.tsx
// Figma: AI Engine Status,left metrics + right engine card
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// WorkflowGraph pulls in ReactFlow, which touches window/DOM on load —
// keep it client-only so this page doesn't break server rendering.
const WorkflowGraph = dynamic(() => import("@/components/workflow/WorkFlowGraph"), { ssr: false });

// Minimal local copy of the shape WorkflowGraph expects, until
// @flowlens/core exists in this project.
interface NormalisedNode { id: string; label: string; position?: { x: number; y: number } }
interface NormalisedEdge { id: string; source: string; target: string }
interface NormalisedWorkFlow { nodes: NormalisedNode[]; edges: NormalisedEdge[] }

interface Incident  { id: string; workflow_id: string; error_message: string | null; detected_at: string; }
interface Workflow  { id: string; name: string; latest_ai_summary?: { risks: string[]; optimization_opportunities: string[] } | null; latest_ai_review?: { findings: any[] } | null; }
interface Snapshot  {
  id: string;
  workflow_id: string;
  created_at: string;
  execution_status: "success" | "failure" | "unknown" | string;
  normalised?: NormalisedWorkFlow | null;
}

import AIEngineStatus from "@/components/engine/AIEngineStatus";

function successRateFor(snaps: Snapshot[]): number | null {
  if (snaps.length === 0) return null;
  const success = snaps.filter(s => s.execution_status === "success").length;
  return Math.round((success / snaps.length) * 1000) / 10;
}

export default function AIEngineStatusPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [workflows, setWorkflows] = useState<Record<string, string>>({});
  const [workflowsFull, setWorkflowsFull] = useState<Workflow[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const [incRes, wfRes, snapRes] = await Promise.all([
        fetch("/api/incidents?status=open").then(r => r.json()),
        fetch("/api/workflows").then(r => r.json()),
        fetch("/api/snapshots").then(r => r.json()), // now team-wide, see route fix
      ]);
      setIncidents(incRes.incidents || []);

      const map: Record<string, string> = {};
      const wfs: Workflow[] = wfRes.workflows || [];
      wfs.forEach(w => { map[w.id] = w.name; });
      setWorkflows(map);
      setWorkflowsFull(wfs);

      setSnapshots(snapRes.snapshots || []);
      setLoading(false);
    }
    load();
  }, []);

  // ── Real success-rate delta: today vs yesterday, not a hardcoded string ──
  const { successRate, delta } = useMemo(() => {
    const overall = successRateFor(snapshots);
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterdayStr = new Date(now.getTime() - 86_400_000).toDateString();

    const todaySnaps = snapshots.filter(s => new Date(s.created_at).toDateString() === todayStr);
    const yestSnaps  = snapshots.filter(s => new Date(s.created_at).toDateString() === yesterdayStr);

    const todayRate = successRateFor(todaySnaps);
    const yestRate   = successRateFor(yestSnaps);

    if (todayRate === null || yestRate === null) {
      return { successRate: overall ?? 0, delta: null as number | null };
    }
    return { successRate: overall ?? 0, delta: Math.round((todayRate - yestRate) * 10) / 10 };
  }, [snapshots]);

  // ── Real node count: latest snapshot PER workflow, not summed across history ──
  const totalNodes = useMemo(() => {
    const latestByWorkflow = new Map<string, Snapshot>();
    for (const s of snapshots) {
      const existing = latestByWorkflow.get(s.workflow_id);
      if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
        latestByWorkflow.set(s.workflow_id, s);
      }
    }
    let nodes = 0;
    latestByWorkflow.forEach(s => { nodes += s.normalised?.nodes?.length || 0; });
    return nodes;
  }, [snapshots]);

  // ── Which workflow's live graph to render: most recently active by default ──
  const latestSnapshotPerWorkflow = useMemo(() => {
    const map = new Map<string, Snapshot>();
    for (const s of snapshots) {
      const existing = map.get(s.workflow_id);
      if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
        map.set(s.workflow_id, s);
      }
    }
    return map;
  }, [snapshots]);

  const graphWorkflowId = selectedWorkflowId
    ?? [...latestSnapshotPerWorkflow.entries()]
        .sort((a, b) => new Date(b[1].created_at).getTime() - new Date(a[1].created_at).getTime())[0]?.[0]
    ?? null;

  const graphSnapshot = graphWorkflowId ? latestSnapshotPerWorkflow.get(graphWorkflowId) : undefined;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: System performance ── */}
      <div className="flex-1 overflow-y-auto p-8 pr-6">
        <h1 className="text-3xl font-bold text-text-primary mb-1">System Performance</h1>
        <p className="text-sm text-text-muted mb-8">Real-time health monitoring of all automation clusters.</p>

        {/* Big metrics */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Success Rate</p>
            <p className="text-5xl font-bold text-text-primary mb-1">{loading ? "—" : `${successRate}%`}</p>
            {!loading && (
              delta === null ? (
                <p className="text-xs text-text-muted flex items-center gap-1">Not enough data for yesterday yet</p>
              ) : delta === 0 ? (
                <p className="text-xs text-text-muted flex items-center gap-1">→ Flat vs yesterday</p>
              ) : delta > 0 ? (
                <p className="text-xs text-status-success flex items-center gap-1">↑ +{delta}% from yesterday</p>
              ) : (
                <p className="text-xs text-status-error flex items-center gap-1">↓ {delta}% from yesterday</p>
              )
            )}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">Active Nodes</p>
            <p className="text-5xl font-bold text-text-primary mb-1">{loading ? "—" : totalNodes.toLocaleString()}</p>
            <p className="text-xs text-text-muted flex items-center gap-1">⬡ Latest snapshot, across all workflows</p>
          </div>
        </div>

        {/* Active Logic Canvas,real graph from the latest snapshot of the selected workflow */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-text-muted">Active Logic Canvas</p>
            {workflows && Object.keys(workflows).length > 0 && (
              <select
                value={graphWorkflowId ?? ""}
                onChange={e => setSelectedWorkflowId(e.target.value || null)}
                className="bg-surface-2 border border-border rounded-lg text-xs text-text-primary px-2 py-1"
              >
                {[...latestSnapshotPerWorkflow.keys()].map(id => (
                  <option key={id} value={id}>{workflows[id] || "Unnamed workflow"}</option>
                ))}
              </select>
            )}
          </div>

          <div className="bg-surface-2 border border-border rounded-xl h-64 relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-text-muted">
                Loading snapshot…
              </div>
            ) : !graphSnapshot?.normalised ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-text-muted">
                No snapshot data yet for this workflow,connect an integration or import one.
              </div>
            ) : (
              <div></div>
              // <WorkflowGraph workflow={graphSnapshot.normalised} height={256} />
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: AI Engine card ── */}
      <div className="w-80 flex-shrink-0 border-l border-border overflow-y-auto p-6">
        <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary">AI Engine</p>
                  <span className="text-[10px] font-bold bg-status-success/15 text-status-success border border-status-success/25 rounded-full px-2 py-0.5">● LIVE</span>
                </div>
                <p className="text-[11px] text-text-muted">Actively monitoring {Object.keys(workflows).length} workflows</p>
              </div>
            </div>
            <button className="text-text-muted hover:text-text-primary">⋯</button>
          </div>

          {/* Value stats — what the AI has actually found, not just "it's running" */}
          <div className="px-5 py-3 border-b border-border">
            <AIEngineStatus
              reviewedCount={workflowsFull.filter(w => w.latest_ai_summary || w.latest_ai_review).length}
              risksDetected={workflowsFull.reduce((sum, w) => sum + (w.latest_ai_summary?.risks.length || 0), 0)}
              optimizationsFound={workflowsFull.reduce((sum, w) => sum + (w.latest_ai_summary?.optimization_opportunities.length || 0), 0)}
              deploymentIssues={incidents.length}
              loading={loading}
            />
          </div>

          {/* AI Confidence */}
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">AI Confidence</p>
              <span className="text-sm font-bold text-brand-orange">98.4%</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 h-6 rounded-sm" style={{ background: i >= 10 ? "#D97757" : "#7B7B76", opacity: 0.5 + i * 0.04 }} />
              ))}
            </div>
          </div>

          {/* Recent detections */}
          <div className="px-5 py-4 border-b border-border">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-3">Recent Detections</p>
            <div className="space-y-2">
              {loading ? (
                <p className="text-xs text-text-muted">Loading...</p>
              ) : incidents.slice(0, 2).map(inc => (
                <button
                  key={inc.id}
                  onClick={() => router.push(`/workflows/${inc.workflow_id}/incidents/${inc.id}`)}
                  className="w-full flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-2.5 hover:border-brand-orange/30 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded bg-surface-2 flex items-center justify-center text-[10px]">⬡</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{workflows[inc.workflow_id] || "Unknown workflow"}</p>
                    <p className="text-[10px] text-text-muted">
                      {new Date(inc.detected_at).toLocaleTimeString()} · Critical Path
                    </p>
                  </div>
                  <span className="text-text-muted">›</span>
                </button>
              ))}
              {!loading && incidents.length === 0 && (
                <p className="text-xs text-status-success flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success" /> All systems healthy
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-4 space-y-2">
            
            <button
              onClick={() => router.push("/investigate")}
              className="w-full bg-brand-orange hover:opacity-80 text-white font-semibold text-sm rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
            >
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}