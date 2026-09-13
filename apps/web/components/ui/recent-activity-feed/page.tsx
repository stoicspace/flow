// ─────────────────────────────────────────────────────────────
// src/components/ui/recent-activity-feed/page.tsx
// ─────────────────────────────────────────────────────────────

"use client";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

interface HistoryEntry {
  id: string;
  workflow_id: string;
  action: string;
  actor_type: "user" | "system" | "ai";
  created_at: string;
  profiles?: { display_name: string };
  // Joined by /api/history when available — lets this feed read as "what
  // changed and what the AI found" instead of a raw action log.
  snapshot?: { ai_summary?: { summary: string; complexity?: "low" | "medium" | "high" } | null } | null;
}

const actorBadge: Record<string, string> = {
  user: "bg-brand-orange/15 text-brand-orange",
  system: "bg-gray-500/15 text-text-muted",
  ai: "bg-brand-orange/20 text-brand-orange",
};

function actionLabel(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function RecentActivityFeed() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then(r => r.json())
      .then(data => { setHistory(data.history || []); setLoading(false); });
  }, []);

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-5">
      {/* Header */}
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-inactive">
        Recent activity feed
      </p>

      {/* Items */}
      <div className="flex flex-col divide-y divide-default">
        {loading ? (
          <p className="text-text-muted text-sm py-2">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-text-muted text-sm py-2">No recent activity</p>
        ) : (
          history.slice(0, 6).map((item, i) => (
            <div key={item.id || i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{actionLabel(item.action)}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${actorBadge[item.actor_type] || actorBadge.system}`}>
                    {item.actor_type === "ai" ? "FlowLens AI" : item.profiles?.display_name || item.actor_type}
                  </span>
                </div>
                {item.snapshot?.ai_summary?.summary ? (
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                    {item.snapshot.ai_summary.summary}
                  </p>
                ) : (
                  <p className="text-xs text-inactive mt-0.5">{item.actor_type}</p>
                )}
                <p className="mt-1 text-[11px] uppercase tracking-wide text-text-muted">
                  {new Date(item.created_at).toLocaleString(undefined, {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <a href="/history">
        <button className="mt-3 flex items-center gap-1 text-xs text-inactive hover:text-text-primary transition-colors">
          Show full history
          <ChevronDown size={12} />
        </button>
      </a>
    </div>
  );
}
