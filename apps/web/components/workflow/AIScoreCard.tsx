// ─────────────────────────────────────────────────────────────
// src/components/workflow/AIScoreCard.tsx
// Compact strip: complexity rating + deployment readiness score.
// Presentational — data comes from /api/ai/summary and /api/ai/deployment-check.
// ─────────────────────────────────────────────────────────────

"use client";

type Complexity = "low" | "medium" | "high";
type DeployStatus = "ready" | "needs_review" | "blocked";

interface Props {
  complexity?: Complexity;
  deploymentScore?: number;
  deploymentStatus?: DeployStatus;
  loading?: boolean;
}

const complexityStyle: Record<Complexity, string> = {
  low: "text-status-success border-status-success/30 bg-status-success/10",
  medium: "text-status-warning border-status-warning/30 bg-status-warning/10",
  high: "text-status-error border-status-error/30 bg-status-error/10",
};

const deployStyle: Record<DeployStatus, { label: string; classes: string }> = {
  ready: { label: "Ready to deploy", classes: "text-status-success border-status-success/30 bg-status-success/10" },
  needs_review: { label: "Needs review", classes: "text-status-warning border-status-warning/30 bg-status-warning/10" },
  blocked: { label: "Blocked", classes: "text-status-error border-status-error/30 bg-status-error/10" },
};

export default function AIScoreCard({ complexity, deploymentScore, deploymentStatus, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-surface-2 border border-border rounded-xl px-5 py-4 flex gap-6">
        <div className="h-10 w-24 bg-surface-3 rounded animate-pulse" />
        <div className="h-10 w-32 bg-surface-3 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-surface-2 border border-border rounded-xl px-5 py-4 flex flex-wrap items-center gap-4">
      <div>
        <p className="text-[11px] text-text-muted uppercase tracking-wide mb-1.5">Complexity</p>
        {complexity ? (
          <span className={`text-xs font-medium border rounded-full px-2.5 py-1 ${complexityStyle[complexity]}`}>
            {complexity}
          </span>
        ) : (
          <span className="text-xs text-text-muted">Unknown</span>
        )}
      </div>
      <div className="w-px h-8 bg-border" />
      <div>
        <p className="text-[11px] text-text-muted uppercase tracking-wide mb-1.5">Deployment Readiness</p>
        <div className="flex items-center gap-2">
          {typeof deploymentScore === "number" && (
            <span className="text-sm font-semibold text-text-primary">{deploymentScore}/100</span>
          )}
          {deploymentStatus ? (
            <span className={`text-xs font-medium border rounded-full px-2.5 py-1 ${deployStyle[deploymentStatus].classes}`}>
              {deployStyle[deploymentStatus].label}
            </span>
          ) : (
            <span className="text-xs text-text-muted">Not checked yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
