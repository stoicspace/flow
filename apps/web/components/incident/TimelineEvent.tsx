// ─────────────────────────────────────────────────────────────
// src/components/incident/TimelineEvent.tsx
// ─────────────────────────────────────────────────────────────

interface TimelineEventProps {
  time: string;
  title: string;
  description: string;
  type: "healthy" | "change" | "connection" | "error" | "blocked" | "ai";
  badge?: string;
  codeDiff?: { removed: string; added: string };
  errorDetail?: string;
  // AI-interpreted commentary attached to this event — e.g. "Copilot: this
  // change removed the retry handler, which is why the next run failed."
  // Rendered as its own highlighted block so it's visually distinct from
  // the raw log line above it.
  aiInterpretation?: string;
}

const iconByType: Record<string, string> = {
  healthy: "✓",
  change: "✎",
  connection: "⚭",
  error: "▦",
  blocked: "⊘",
  ai: "✦",
};

const colorByType: Record<string, string> = {
  healthy: "text-brand-orange border-brand-orange/40 bg-brand-orange/10",
  change: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  connection: "text-amber-400 border-amber-400/40 bg-amber-400/10",
  error: "text-status-error border-status-error/40 bg-status-error/10",
  blocked: "text-text-muted border-gray-600/40 bg-gray-600/10",
  ai: "text-brand-orange border-brand-orange/40 bg-brand-orange/10",
};

export default function TimelineEvent({
  time,
  title,
  description,
  type,
  badge,
  codeDiff,
  errorDetail,
  aiInterpretation,
}: TimelineEventProps) {
  const isError = type === "error";

  return (
    <div className="relative pl-0">
      {/* Timeline dot */}
      <div
        className={`absolute -left-[52px] w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm ${colorByType[type]}`}
      >
        {iconByType[type]}
      </div>

      <p className="text-xs font-semibold tracking-wide uppercase mb-2 text-text-muted">
        {time}
      </p>

      <div
        className={`bg-surface-2 border rounded-xl p-5 ${
          isError ? "border-status-error/40" : "border-border"
        }`}
      >
        <div className="flex items-start justify-between mb-1.5">
          <h3 className={`text-base font-semibold ${isError ? "text-status-error" : "text-text-primary"}`}>
            {title}
          </h3>
          {isError && <span className="text-status-error text-lg">!</span>}
        </div>

        <p className="text-sm text-text-muted leading-relaxed">{description}</p>

        {badge && (
          <span className="inline-block mt-3 text-[11px] font-semibold tracking-wide text-brand-orange bg-brand-orange/10 border border-brand-orange/20 rounded px-2.5 py-1">
            {badge}
          </span>
        )}

        {codeDiff && (
          <div className="mt-3 bg-surface rounded-lg border border-border-light px-4 py-3 font-mono text-xs space-y-1">
            <p className="text-status-error">- {codeDiff.removed}</p>
            <p className="text-status-success">+ {codeDiff.added}</p>
          </div>
        )}

        {errorDetail && (
          <div className="mt-3 bg-surface rounded-lg border border-status-error/20 px-4 py-3 font-mono text-xs text-status-error/90">
            Error: {errorDetail}
          </div>
        )}

        {aiInterpretation && (
          <div className="mt-3 bg-brand-orange/10 border border-brand-orange/20 rounded-lg px-4 py-3">
            <p className="text-[10px] font-semibold tracking-wide text-brand-orange uppercase mb-1">
              ✦ AI Interpretation
            </p>
            <p className="text-xs text-text-muted leading-relaxed">{aiInterpretation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
