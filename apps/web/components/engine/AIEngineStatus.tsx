// ─────────────────────────────────────────────────────────────
// src/components/engine/AIEngineStatus.tsx
// Value-focused replacement for a raw "engine is running" status —
// the person cares what the AI has found, not that it's alive.
// ─────────────────────────────────────────────────────────────

"use client";

interface Props {
  reviewedCount: number;
  risksDetected: number;
  optimizationsFound: number;
  deploymentIssues: number;
  loading?: boolean;
}

export default function AIEngineStatus({
  reviewedCount,
  risksDetected,
  optimizationsFound,
  deploymentIssues,
  loading,
}: Props) {
  const stats = [
    { label: "workflows reviewed", value: reviewedCount },
    { label: "risks detected", value: risksDetected },
    { label: "optimizations", value: optimizationsFound },
    { label: "deployment issues", value: deploymentIssues },
  ];

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <div className="h-4 w-48 bg-surface-3 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <p className="text-xs text-text-muted">
      {stats.map((s, i) => (
        <span key={s.label}>
          <span className="text-text-primary font-semibold">{s.value}</span> {s.label}
          {i < stats.length - 1 ? " · " : ""}
        </span>
      ))}
    </p>
  );
}
