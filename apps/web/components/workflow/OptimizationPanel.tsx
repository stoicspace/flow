// ─────────────────────────────────────────────────────────────
// src/components/workflow/OptimizationPanel.tsx
// List of AI-suggested optimization opportunities.
// Presentational — data comes from /api/ai/optimize via the parent page.
// ─────────────────────────────────────────────────────────────

"use client";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  node_id?: string;
}

interface Props {
  opportunities?: Opportunity[];
  loading?: boolean;
  onRunOptimization?: () => void;
}

const impactStyle: Record<string, string> = {
  low: "text-text-muted border-border",
  medium: "text-status-warning border-status-warning/30",
  high: "text-brand-orange border-brand-orange/30",
};

export default function OptimizationPanel({ opportunities = [], loading, onRunOptimization }: Props) {
  return (
    <div className="bg-surface-2 border border-border rounded-xl px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-text-muted uppercase tracking-wide">Optimization Opportunities</p>
        {onRunOptimization && (
          <button
            onClick={onRunOptimization}
            disabled={loading}
            className="text-[11px] text-brand-orange hover:opacity-80 disabled:opacity-40 transition"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          <div className="h-8 w-full bg-surface-3 rounded animate-pulse" />
          <div className="h-8 w-full bg-surface-3 rounded animate-pulse" />
        </div>
      )}

      {!loading && opportunities.length === 0 && (
        <p className="text-xs text-text-muted">No optimization opportunities found yet.</p>
      )}

      {!loading && opportunities.length > 0 && (
        <div className="space-y-2.5">
          {opportunities.map(opp => (
            <div key={opp.id} className="bg-surface border border-border rounded-lg px-3.5 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-text-primary">{opp.title}</p>
                <span className={`text-[10px] font-medium uppercase border rounded px-1.5 py-0.5 ${impactStyle[opp.impact]}`}>
                  {opp.impact}
                </span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">{opp.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
