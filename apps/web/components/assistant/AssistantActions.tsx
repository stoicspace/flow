// ─────────────────────────────────────────────────────────────
// src/components/assistant/AssistantActions.tsx
// ─────────────────────────────────────────────────────────────

"use client";

interface Props3 {
  onApplyFix: () => void;
  onRestore: () => void;
  onOpenCompare: () => void;
  applyingFix?: boolean;
  restoring?: boolean;
  // Optional Copilot actions — only rendered when a handler is passed in,
  // so existing usages of this component (without these props) are unaffected.
  onViewDocumentation?: () => void;
  onCheckDeploymentReadiness?: () => void;
  loadingDocumentation?: boolean;
  loadingDeploymentCheck?: boolean;
}

export default function AssistantActions({
  onApplyFix,
  onRestore,
  onOpenCompare,
  applyingFix,
  restoring,
  onViewDocumentation,
  onCheckDeploymentReadiness,
  loadingDocumentation,
  loadingDeploymentCheck,
}: Props3) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <button
        onClick={onApplyFix}
        disabled={applyingFix}
        className="flex items-center gap-1.5 bg-surface-3 border border-border rounded-lg px-3.5 py-2 text-xs font-medium text-text-primary hover:border-brand-orange/40 transition-colors disabled:opacity-60"
      >
        ✨ {applyingFix ? "Applying..." : "Apply AI Fix"}
      </button>
      <button
        onClick={onRestore}
        disabled={restoring}
        className="flex items-center gap-1.5 bg-surface-3 border border-border rounded-lg px-3.5 py-2 text-xs font-medium text-text-primary hover:border-gray-500 transition-colors disabled:opacity-60"
      >
        ↺ {restoring ? "Restoring..." : "Restore Version"}
      </button>
      <button
        onClick={onOpenCompare}
        className="flex items-center gap-1.5 bg-surface-3 border border-border rounded-lg px-3.5 py-2 text-xs font-medium text-text-primary hover:border-gray-500 transition-colors"
      >
        ⇗ Open Compare
      </button>
      {onViewDocumentation && (
        <button
          onClick={onViewDocumentation}
          disabled={loadingDocumentation}
          className="flex items-center gap-1.5 bg-surface-3 border border-border rounded-lg px-3.5 py-2 text-xs font-medium text-text-primary hover:border-gray-500 transition-colors disabled:opacity-60"
        >
          📄 {loadingDocumentation ? "Generating..." : "View Documentation"}
        </button>
      )}
      {onCheckDeploymentReadiness && (
        <button
          onClick={onCheckDeploymentReadiness}
          disabled={loadingDeploymentCheck}
          className="flex items-center gap-1.5 bg-surface-3 border border-border rounded-lg px-3.5 py-2 text-xs font-medium text-text-primary hover:border-gray-500 transition-colors disabled:opacity-60"
        >
          🚀 {loadingDeploymentCheck ? "Checking..." : "Check Deployment Readiness"}
        </button>
      )}
    </div>
  );
}
