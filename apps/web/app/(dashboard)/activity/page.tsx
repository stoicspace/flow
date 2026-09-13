
// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/activity/page.tsx
// Figma: Recent Activity Feed,main feed + right stats sidebar
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GitBranch, RotateCcw, Upload, Zap, Shield } from "lucide-react";

interface HistoryEntry {
  id: string;
  workflow_id: string;
  action: string;
  actor_type: "user" | "system" | "ai";
  created_at: string;
  profiles?: { display_name: string };
}

function actionIcon(action: string) {
  if (action.includes("restore"))  return <RotateCcw size={14} />;
  if (action.includes("import"))   return <Upload size={14} />;
  if (action.includes("snapshot")) return <GitBranch size={14} />;
  if (action.includes("incident")) return <Shield size={14} />;
  return <Zap size={14} />;
}

const leftBorder: Record<string, string> = {
  user:   "border-l-brand-blue",
  system: "border-l-status-warning",
  ai:     "border-l-brand-orange",
};

const iconBg: Record<string, string> = {
  user:   "bg-brand-orange/10 text-brand-orange",
  system: "bg-status-warning/10 text-status-warning",
  ai:     "bg-brand-orange text-brand-orange",
};

function groupByDate(entries: HistoryEntry[]) {
  return entries.reduce<Record<string, HistoryEntry[]>>((acc, e) => {
    const d = new Date(e.created_at);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const label = diff === 0 ? "TODAY" : diff === 1 ? "YESTERDAY" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
    (acc[label] = acc[label] || []).push(e);
    return acc;
  }, {});
}

const topActors = [
  { name: "FlowLens Engine", role: "Automated Patching", count: 142, icon: "⚡" },
  { name: "Alex Dev",        role: "Senior DevOps",      count: 85,  icon: "👤" },
  { name: "System",          role: "System Admin",       count: 42,  icon: "⚙" },
];

export default function ActivityPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then(r => r.json())
      .then(data => { setHistory(data.history || []); setLoading(false); });
  }, []);

  const grouped = groupByDate(history);

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: Activity feed ── */}
      <div className="flex-1 overflow-y-auto p-8 pr-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Recent Activity</h1>
            <p className="text-sm text-text-muted mt-1">Real-time audit log across all active clusters</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Date Range", "User", "Severity"].map(f => (
              <button key={f} className="text-xs bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-text-muted hover:text-text-primary hover:border-gray-500 transition-colors flex items-center gap-1">
                {f} ▾
              </button>
            ))}
            <button className="text-xs bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-text-muted hover:text-text-primary hover:border-gray-500 transition-colors">
              ⬇ Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-text-muted text-sm">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-text-muted text-sm">No activity yet.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, entries]) => (
              <div key={date}>
                <div className="inline-block text-[10px] font-bold tracking-widest text-text-muted border border-border rounded px-2 py-0.5 mb-4">{date}</div>
                <div className="space-y-3">
                  {entries.map(entry => (
                    <div
                      key={entry.id}
                      className={`bg-surface-2 border border-border border-l-2 ${leftBorder[entry.actor_type]} rounded-xl p-5`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg[entry.actor_type]}`}>
                          {actionIcon(entry.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-text-primary">
                              {entry.action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                            </h3>
                            <span className="text-xs text-text-muted">
                              {new Date(entry.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mb-3">
                            Workflow ID: {entry.workflow_id.slice(0, 8)}...
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center text-[10px]">
                                {entry.actor_type === "ai" ? "✦" : entry.actor_type === "system" ? "⚙" : "👤"}
                              </div>
                              <span className="text-xs text-text-muted">
                                {entry.actor_type === "ai" ? "FlowLens Engine" : entry.profiles?.display_name || "System"}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                href={`/workflows/${entry.workflow_id}`}
                                className="text-xs bg-surface border border-border rounded px-2.5 py-1 text-text-muted hover:text-text-primary transition-colors"
                              >
                                Go to Workflow
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: Stats sidebar ── */}
      <div className="w-72 flex-shrink-0 border-l border-border overflow-y-auto p-6 space-y-6">
        {/* Events per hour bar chart */}
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-4">Events Per Hour</p>
          <div className="flex items-end gap-1 h-20">
            {[30, 45, 20, 60, 35, 80, 55, 90, 40, 65, 75, 100].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 11 ? "#3b82f6" : "#1c2230" }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-text-muted mt-1">
            <span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span>
          </div>
        </div>

        {/* Top actors */}
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-3">Top Actors</p>
          <div className="space-y-3">
            {topActors.map((actor, i) => (
              <div key={actor.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-sm flex-shrink-0">
                  {actor.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{actor.name}</p>
                  <p className="text-[10px] text-text-muted">{actor.role}</p>
                </div>
                <span className="text-xs font-semibold text-text-muted">{actor.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most modified */}
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-3">Most Modified</p>
          <div className="space-y-2">
            {[
              { name: "CRM Sync",       edits: 24, pct: 90, color: "bg-status-error" },
              { name: "Lead Classifier", edits: 18, pct: 65, color: "bg-status-warning" },
              { name: "Shopify Webhook", edits: 9,  pct: 35, color: "bg-status-warning" },
            ].map(item => (
              <div key={item.name} className="bg-surface-2 border border-border rounded-lg px-3 py-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-medium text-text-primary">{item.name}</span>
                  <span className="text-[10px] text-text-muted">{item.edits} edits</span>
                </div>
                <div className="h-1 bg-surface rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live audit stream */}
        <div className="bg-surface-2 border border-border rounded-xl p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-status-success mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            LIVE AUDIT STREAM ACTIVE
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            Monitoring 4 active clusters in US-EAST and EU-WEST regions.
          </p>
        </div>
      </div>
    </div>
  );
}

