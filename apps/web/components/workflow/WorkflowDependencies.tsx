// ─────────────────────────────────────────────────────────────
// src/components/workflow/WorkflowDependencies.tsx
// Upstream credential/dependency chips — extracted out of AIInsightsPanel
// so it can be reused (e.g. in DeploymentReadiness context) without
// duplicating the chip markup.
// ─────────────────────────────────────────────────────────────

"use client";

interface Props {
  dependencies: string[];
  title?: string;
}

export default function WorkflowDependencies({ dependencies, title = "Upstream Dependencies" }: Props) {
  return (
    <div>
      <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {dependencies.length === 0 && (
          <span className="text-xs text-text-muted">None detected</span>
        )}
        {dependencies.map(dep => (
          <span
            key={dep}
            className="text-[11px] bg-surface border border-border rounded px-2 py-1 text-text-muted"
          >
            {dep}
          </span>
        ))}
      </div>
    </div>
  );
}
