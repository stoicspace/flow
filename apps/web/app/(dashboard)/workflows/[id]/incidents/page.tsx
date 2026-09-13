// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/workflows/[id]/incidents/page.tsx
// AI-first incident list for a single workflow.
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface Incident {
  id: string;
  workflow_id: string;
  status: string;
  detected_at: string;
  error_message: string | null;
  problem: string | null;
  root_cause: string | null;
  business_impact: string | null;
  confidence: number | null;
}

interface Workflow {
  id: string;
  name: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const impactStyle: Record<string, string> = {
  high: "bg-status-error/15 text-status-error border-status-error/25",
  medium: "bg-amber-400/15 text-amber-400 border-amber-400/25",
  low: "bg-status-success/15 text-status-success border-status-success/25",
};

function confidenceImpact(confidence: number | null): "low" | "medium" | "high" {
  const c = confidence ?? 0;
  return c > 0.75 ? "high" : c > 0.4 ? "medium" : "low";
}

export default function WorkflowIncidentsPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statusFilter, setStatusFilter] = useState<"open" | "resolved">("open");
  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [wfRes, incRes] = await Promise.all([
        fetch(`/api/workflows/${workflowId}`).then(r => r.json()),
        fetch(`/api/incidents?workflow_id=${workflowId}&status=${statusFilter}`).then(r => r.json()),
      ]);
      setWorkflow(wfRes.workflow || null);
      setIncidents(incRes.incidents || []);
      setLoading(false);
    }
    load();
  }, [workflowId, statusFilter]);

  // Kick off AI analysis for an incident straight from the list, so the
  // person doesn't have to open the detail page just to see the root cause.
  async function runAnalysis(incidentId: string) {
    setAnalysing(incidentId);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/analyse`, { method: "POST" }).then(r => r.json());
      if (res.analysis) {
        setIncidents(prev =>
          prev.map(inc =>
            inc.id === incidentId
              ? {
                  ...inc,
                  problem: res.analysis.problem,
                  root_cause: res.analysis.root_cause,
                  business_impact: res.analysis.business_impact,
                  confidence: res.analysis.confidence,
                }
              : inc
          )
        );
      }
    } finally {
      setAnalysing(null);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-text-primary">
          Incidents{workflow ? ` · ${workflow.name}` : ""}
        </h1>
      </div>
      <p className="text-sm text-text-muted mb-6">
        AI-analyzed failures for this workflow — problem, root cause, and business impact at a glance.
      </p>

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-5">
        {(["open", "resolved"] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs font-medium rounded-full px-3.5 py-1.5 border transition-colors capitalize ${
              statusFilter === s
                ? "bg-brand-orange/15 text-brand-orange border-brand-orange/30"
                : "bg-surface-2 text-text-muted border-border hover:border-gray-500"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <div className="bg-surface-2 border border-dashed border-border rounded-xl p-10 text-center">
          <CheckCircle size={28} className="text-status-success mx-auto mb-3" />
          <p className="text-sm text-text-muted">
            No {statusFilter} incidents for this workflow.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map(inc => {
            const impact = confidenceImpact(inc.confidence);
            const hasAnalysis = !!inc.root_cause;
            return (
              <div
                key={inc.id}
                className="bg-surface-2 border border-border rounded-xl p-5 hover:border-brand-orange/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/workflows/${workflowId}/incidents/${inc.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Clock size={12} />
                    {timeAgo(inc.detected_at)}
                  </div>
                  {hasAnalysis && (
                    <span className={`text-[10px] font-bold tracking-wide rounded px-2 py-0.5 border ${impactStyle[impact]}`}>
                      {impact.toUpperCase()} IMPACT
                    </span>
                  )}
                </div>

                {/* Problem is the primary headline — falls back to raw error if not yet analysed */}
                <p className="text-sm font-medium text-text-primary mb-1">
                  {inc.problem || inc.error_message || "Investigating..."}
                </p>

                {hasAnalysis ? (
                  <>
                    <p className="text-xs text-text-muted leading-relaxed mb-1">
                      <span className="text-text-primary font-medium">Root cause: </span>
                      {inc.root_cause}
                    </p>
                    {inc.business_impact && (
                      <p className="text-xs text-text-muted leading-relaxed">
                        <span className="text-text-primary font-medium">Business impact: </span>
                        {inc.business_impact}
                      </p>
                    )}
                  </>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); runAnalysis(inc.id); }}
                    disabled={analysing === inc.id}
                    className="mt-1 text-xs font-medium text-brand-orange hover:opacity-80 disabled:opacity-50 transition"
                  >
                    {analysing === inc.id ? "Analyzing..." : "✦ Run AI Analysis"}
                  </button>
                )}

                {!hasAnalysis && inc.error_message && (
                  <p className="text-xs text-text-muted mt-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-status-error" />
                    {inc.error_message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
