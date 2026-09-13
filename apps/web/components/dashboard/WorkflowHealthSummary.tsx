// ─────────────────────────────────────────────────────────────
// src/components/dashboard/WorkflowHealthSummary.tsx
// Team-wide rollup: workflows needing attention, reviewed count,
// deployment risks, optimization opportunities — the numbers the PRD
// wants front and center instead of a single uptime percentage.
// ─────────────────────────────────────────────────────────────

"use client";

interface WorkflowSummary {
  id: string;
  status: "healthy" | "degraded" | "failing" | "unknown";
  latest_ai_summary?: { risks: string[]; optimization_opportunities: string[] } | null;
  latest_ai_review?: { findings: any[] } | null;
}

interface Props {
  workflows: WorkflowSummary[];
  incidentCount: number;
  loading?: boolean;
}

export default function WorkflowHealthSummary({ workflows, incidentCount, loading }: Props) {
  const needingAttention = workflows.filter(w => w.status === "failing" || w.status === "degraded").length;
  const reviewed = workflows.filter(w => w.latest_ai_review || w.latest_ai_summary).length;
  const deploymentRisks = workflows.reduce((sum, w) => sum + (w.latest_ai_summary?.risks.length || 0), 0);
  const optimizations = workflows.reduce(
    (sum, w) => sum + (w.latest_ai_summary?.optimization_opportunities.length || 0),
    0
  );

  const stats = [
    { label: "Needing Attention", value: needingAttention, tone: needingAttention > 0 ? "text-status-error" : "text-status-success" },
    { label: "Workflows Reviewed", value: reviewed, tone: "text-text-primary" },
    { label: "Deployment Risks", value: deploymentRisks, tone: deploymentRisks > 0 ? "text-amber-400" : "text-status-success" },
    { label: "Optimizations Found", value: optimizations, tone: "text-brand-orange" },
  ];

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
        Workflow Health Summary
      </p>
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-surface-3 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.label} className="bg-surface rounded-lg border border-border-light px-3 py-2.5">
              <p className={`text-xl font-bold ${s.tone}`}>{s.value}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}
      {!loading && incidentCount > 0 && (
        <p className="text-xs text-status-error mt-3">
          {incidentCount} open incident{incidentCount > 1 ? "s" : ""} — see Investigate.
        </p>
      )}
    </div>
  );
}
