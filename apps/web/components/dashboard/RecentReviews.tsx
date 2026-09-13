// ─────────────────────────────────────────────────────────────
// src/components/dashboard/RecentReviews.tsx
// Workflows with a recent AI review, most recently reviewed first.
// ─────────────────────────────────────────────────────────────

"use client";
import Link from "next/link";

interface WorkflowWithReview {
  id: string;
  name: string;
  latest_ai_summary?: { complexity: "low" | "medium" | "high"; summary: string } | null;
  latest_ai_review?: { overall_risk: "critical" | "high" | "medium" | "low"; reviewed_at: string } | null;
}

interface Props {
  workflows: WorkflowWithReview[];
  loading?: boolean;
  limit?: number;
}

const riskStyle: Record<string, string> = {
  critical: "text-status-error",
  high: "text-status-error",
  medium: "text-amber-400",
  low: "text-status-success",
};

export default function RecentReviews({ workflows, loading, limit = 5 }: Props) {
  const reviewed = workflows
    .filter(w => w.latest_ai_review?.reviewed_at)
    .sort(
      (a, b) =>
        new Date(b.latest_ai_review!.reviewed_at).getTime() -
        new Date(a.latest_ai_review!.reviewed_at).getTime()
    )
    .slice(0, limit);

  return (
    <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border-light">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Recent Workflow Reviews</h3>
      </div>
      <div className="divide-y divide-border-light">
        {loading ? (
          <p className="text-xs text-text-muted px-4 py-6 text-center">Loading...</p>
        ) : reviewed.length === 0 ? (
          <p className="text-xs text-text-muted px-4 py-6 text-center">
            No AI reviews yet. Run one from a workflow's Deployment Readiness panel.
          </p>
        ) : (
          reviewed.map(wf => (
            <Link
              key={wf.id}
              href={`/workflows/${wf.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-3/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{wf.name}</p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {new Date(wf.latest_ai_review!.reviewed_at).toLocaleDateString(undefined, {
                    month: "short", day: "numeric",
                  })}
                </p>
              </div>
              <span className={`text-[10px] font-bold uppercase flex-shrink-0 ${riskStyle[wf.latest_ai_review!.overall_risk]}`}>
                {wf.latest_ai_review!.overall_risk}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
