// ─────────────────────────────────────────────────────────────
// src/components/diff/AIExplanationCard.tsx
// ─────────────────────────────────────────────────────────────

"use client";

interface SuggestedFix {
  description: string;
  node_id?: string;
  field?: string;
}

interface Props {
  rootCause: string;
  confidence: number;
  impactSummary: string;
  suggestedFix: SuggestedFix | null;
  onApplyFix?: () => void;
  applying?: boolean;
}

export default function AIExplanationCard({
  rootCause,
  confidence,
  impactSummary,
  suggestedFix,
  onApplyFix,
  applying,
}: Props) {
  return (
    <div className="bg-surface-2 border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">AI Explanation</h3>
        <span className="text-xs text-text-muted">
          {Math.round(confidence * 100)}% confidence
        </span>
      </div>

      <p className="text-sm text-text-muted leading-relaxed mb-3">
        {rootCause}
      </p>

      <div className="bg-surface rounded-lg border border-border-light px-3 py-2.5 mb-4">
        <p className="text-[11px] text-text-muted uppercase tracking-wide mb-1">Impact</p>
        <p className="text-xs text-text-muted leading-relaxed">{impactSummary}</p>
      </div>

      {suggestedFix && (
        <div className="flex items-center justify-between bg-brand-orange/10 border border-brand-orange/20 rounded-lg px-3 py-2.5">
          <p className="text-xs text-brand-orange flex-1 mr-3">
            {suggestedFix.description}
          </p>
          {onApplyFix && (
            <button
              onClick={onApplyFix}
              disabled={applying}
              className="text-xs font-medium bg-brand-orange text-text-primary rounded px-3 py-1.5 whitespace-nowrap disabled:opacity-60 hover:opacity-90 transition-opacity"
            >
              {applying ? "Applying..." : "Apply Fix"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}


