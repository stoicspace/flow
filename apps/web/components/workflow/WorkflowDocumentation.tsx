// ─────────────────────────────────────────────────────────────
// src/components/workflow/WorkflowDocumentation.tsx
// Renders AI-generated documentation for a workflow.
// Presentational — data comes from /api/ai/document via the parent page.
// ─────────────────────────────────────────────────────────────

"use client";

interface DocSection {
  heading: string;
  content: string;
}

interface NodeDoc {
  node_id: string;
  label: string;
  purpose: string;
}

interface Props {
  title?: string;
  overview?: string;
  sections?: DocSection[];
  nodeDocs?: NodeDoc[];
  loading?: boolean;
  onGenerate?: () => void;
}

export default function WorkflowDocumentation({
  title,
  overview,
  sections = [],
  nodeDocs = [],
  loading,
  onGenerate,
}: Props) {
  const hasContent = !!overview || sections.length > 0 || nodeDocs.length > 0;

  return (
    <div className="bg-surface-2 border border-border rounded-xl px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-text-muted uppercase tracking-wide">Documentation</p>
        {onGenerate && (
          <button
            onClick={onGenerate}
            disabled={loading}
            className="text-[11px] text-brand-orange hover:opacity-80 disabled:opacity-40 transition"
          >
            {loading ? "Generating..." : hasContent ? "Regenerate" : "Generate"}
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          <div className="h-3 w-full bg-surface-3 rounded animate-pulse" />
          <div className="h-3 w-4/5 bg-surface-3 rounded animate-pulse" />
        </div>
      )}

      {!loading && !hasContent && (
        <p className="text-xs text-text-muted">No documentation generated yet.</p>
      )}

      {!loading && hasContent && (
        <div className="space-y-4">
          {title && <p className="text-sm font-semibold text-text-primary">{title}</p>}
          {overview && <p className="text-xs text-text-muted leading-relaxed">{overview}</p>}

          {sections.length > 0 && (
            <div className="space-y-3">
              {sections.map((s, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-text-primary mb-0.5">{s.heading}</p>
                  <p className="text-[11px] text-text-muted leading-relaxed">{s.content}</p>
                </div>
              ))}
            </div>
          )}

          {nodeDocs.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Nodes
              </p>
              <div className="space-y-1.5">
                {nodeDocs.map(n => (
                  <div key={n.node_id} className="flex gap-2 text-[11px]">
                    <span className="text-text-primary font-medium">{n.label}</span>
                    <span className="text-text-muted">— {n.purpose}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
