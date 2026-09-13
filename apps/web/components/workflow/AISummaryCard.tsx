// ─────────────────────────────────────────────────────────────
// src/components/workflow/AISummaryCard.tsx
// Plain-language AI summary of what the workflow does.
// Presentational — data comes from /api/ai/summary via the parent page.
// ─────────────────────────────────────────────────────────────

"use client";

interface Props {
  summary?: string;
  loading?: boolean;
}

export default function AISummaryCard({ summary, loading }: Props) {
  return (
    <div className="bg-surface-2 border border-border rounded-xl px-5 py-4">
      <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2">AI Summary</p>
      {loading ? (
        <div className="h-4 w-3/4 bg-surface-3 rounded animate-pulse" />
      ) : (
        <p className="text-sm text-text-primary leading-relaxed">
          {summary || "AI summary isn't available for this workflow yet."}
        </p>
      )}
    </div>
  );
}
