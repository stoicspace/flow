// ─────────────────────────────────────────────────────────────
// src/components/workflow/DeploymentReadiness.tsx
// Blocking issues + warnings checklist for going to production.
// Presentational — data comes from /api/ai/deployment-check via the parent page.
// ─────────────────────────────────────────────────────────────

"use client";

interface Props {
  score?: number;
  status?: "ready" | "needs_review" | "blocked";
  blockingIssues?: string[];
  warnings?: string[];
  loading?: boolean;
  onRunCheck?: () => void;
}

export default function DeploymentReadiness({
  score,
  status,
  blockingIssues = [],
  warnings = [],
  loading,
  onRunCheck,
}: Props) {
  return (
    <div className="bg-surface-2 border border-border rounded-xl px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-text-muted uppercase tracking-wide">Deployment Readiness</p>
        {onRunCheck && (
          <button
            onClick={onRunCheck}
            disabled={loading}
            className="text-[11px] text-brand-orange hover:opacity-80 disabled:opacity-40 transition"
          >
            {loading ? "Checking..." : "Re-check"}
          </button>
        )}
      </div>

      {status === undefined && !loading && (
        <p className="text-xs text-text-muted">Run a deployment check to see readiness.</p>
      )}

      {loading && (
        <div className="space-y-2">
          <div className="h-3 w-2/3 bg-surface-3 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-surface-3 rounded animate-pulse" />
        </div>
      )}

      {!loading && status !== undefined && (
        <>
          {blockingIssues.length === 0 && warnings.length === 0 && (
            <p className="text-xs text-status-success">No blocking issues or warnings found.</p>
          )}

          {blockingIssues.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] font-semibold text-status-error mb-1.5">
                Blocking ({blockingIssues.length})
              </p>
              <ul className="space-y-1">
                {blockingIssues.map((issue, i) => (
                  <li key={i} className="text-xs text-text-muted flex gap-2">
                    <span className="text-status-error">✕</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-status-warning mb-1.5">
                Warnings ({warnings.length})
              </p>
              <ul className="space-y-1">
                {warnings.map((warning, i) => (
                  <li key={i} className="text-xs text-text-muted flex gap-2">
                    <span className="text-status-warning">!</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
