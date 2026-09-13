// ─────────────────────────────────────────────────────────────
// src/components/search/SemanticSearch.tsx
// Standalone natural-language workflow search — "Where is Stripe used?",
// "Which workflows send emails?". Backed by GET /api/search?q=...
// ─────────────────────────────────────────────────────────────

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Search } from "lucide-react";

interface Match {
  workflow_id: string;
  workflow_name: string;
  reason: string;
}

const suggestions = [
  "Where is Stripe used?",
  "Which workflows send emails?",
  "Show workflows without retries.",
];

export default function SemanticSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setMatches([]);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r => r.json());
      if (res.error) throw new Error(res.error);
      setAnswer(res.answer);
      setMatches(res.matches || []);
    } catch (e: any) {
      setError(e.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface-2 border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-brand-orange" />
        <h3 className="text-sm font-semibold text-text-primary">Ask about your workflows</h3>
      </div>

      <form
        onSubmit={e => { e.preventDefault(); runSearch(query); }}
        className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 mb-3"
      >
        <Search size={14} className="text-text-muted flex-shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Where is Stripe used?"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="text-xs font-medium text-brand-orange hover:opacity-80 disabled:opacity-40 transition"
        >
          {loading ? "Searching..." : "Ask"}
        </button>
      </form>

      {!answer && !loading && !error && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => { setQuery(s); runSearch(s); }}
              className="text-[11px] text-text-muted bg-surface border border-border rounded-full px-2.5 py-1 hover:border-brand-orange/40 hover:text-text-primary transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          <div className="h-3 w-full bg-surface-3 rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-surface-3 rounded animate-pulse" />
        </div>
      )}

      {error && <p className="text-xs text-status-error">{error}</p>}

      {answer && !loading && (
        <div>
          <p className="text-sm text-text-muted leading-relaxed mb-3">{answer}</p>
          {matches.length > 0 && (
            <div className="space-y-1.5">
              {matches.map(m => (
                <button
                  key={m.workflow_id}
                  onClick={() => router.push(`/workflows/${m.workflow_id}`)}
                  className="w-full flex items-center justify-between bg-surface border border-border rounded-lg px-3 py-2 text-left hover:border-brand-orange/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{m.workflow_name}</p>
                    <p className="text-[11px] text-text-muted truncate">{m.reason}</p>
                  </div>
                  <span className="text-text-muted flex-shrink-0">›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
