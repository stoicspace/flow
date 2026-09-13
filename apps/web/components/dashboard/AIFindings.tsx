// ─────────────────────────────────────────────────────────────
// src/components/dashboard/AIFindings.tsx
// Aggregated AI review findings across all workflows, most severe first.
// ─────────────────────────────────────────────────────────────

"use client";
import Link from "next/link";

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  node_id?: string;
}

interface WorkflowWithReview {
  id: string;
  name: string;
  latest_ai_review?: { findings: Finding[]; overall_risk: string } | null;
}

interface Props {
  workflows: WorkflowWithReview[];
  loading?: boolean;
  limit?: number;
}

const severityRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const severityStyle: Record<string, string> = {
  critical: "bg-status-error/15 text-status-error border-status-error/25",
  high: "bg-status-error/10 text-status-error border-status-error/20",
  medium: "bg-amber-400/15 text-amber-400 border-amber-400/25",
  low: "bg-status-success/15 text-status-success border-status-success/25",
};

export default function AIFindings({ workflows, loading, limit = 6 }: Props) {
  const allFindings = workflows
    .flatMap(wf =>
      (wf.latest_ai_review?.findings || []).map(f => ({ ...f, workflowId: wf.id, workflowName: wf.name }))
    )
    .sort((a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9))
    .slice(0, limit);

  return (
    <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border-light">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">AI Findings</h3>
      </div>
      <div className="divide-y divide-border-light">
        {loading ? (
          <p className="text-xs text-text-muted px-4 py-6 text-center">Loading...</p>
        ) : allFindings.length === 0 ? (
          <p className="text-xs text-text-muted px-4 py-6 text-center">
            No findings yet. Run a review from a workflow page to populate this.
          </p>
        ) : (
          allFindings.map((f, i) => (
            <Link
              key={`${f.workflowId}-${f.id}-${i}`}
              href={`/workflows/${f.workflowId}`}
              className="flex items-start gap-3 px-4 py-3 hover:bg-surface-3/50 transition-colors"
            >
              <span className={`text-[10px] font-bold uppercase border rounded px-1.5 py-0.5 mt-0.5 flex-shrink-0 ${severityStyle[f.severity]}`}>
                {f.severity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{f.title}</p>
                <p className="text-[11px] text-text-muted mt-0.5 truncate">{f.workflowName}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
