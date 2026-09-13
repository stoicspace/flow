// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/notifications/page.tsx
// Figma: Notifications screen,left feed + right health panel
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect, useMemo, useCallback, JSX } from "react";
import { AlertTriangle, Info, Zap } from "lucide-react";
import Link from "next/link";

type Tab = "All" | "Critical" | "Warnings" | "System";
type NotifType = "error" | "warning" | "info" | "success";

interface Notification {
  id: string;
  type: NotifType;
  category: string | null;
  title: string;
  description: string;
  workflow_id: string | null;
  source_type: "incident" | "connection" | "ai_suggestion" | "system";
  source_id: string | null;
  action_url: string | null;
  action_label: string | null;
  read: boolean;
  created_at: string;
}

interface Stats {
  windowDays: number;
  uptime: number | null;
  totalAlerts: number;
  avgResolveMinutes: number | null;
  commonIssues: { label: string; count: number; badge: string }[];
  error?: string;
}

const tabFilter: Record<Tab, NotifType[]> = {
  All: ["error", "warning", "success", "info"],
  Critical: ["error"],
  Warnings: ["warning"],
  System: ["info", "success"],
};

const typeIcon: Record<NotifType, JSX.Element> = {
  error: <div className="w-8 h-8 rounded-full bg-status-error/15 border border-status-error/30 flex items-center justify-center"><AlertTriangle size={14} className="text-status-error" /></div>,
  warning: <div className="w-8 h-8 rounded-full bg-status-warning/15 border border-status-warning/30 flex items-center justify-center"><AlertTriangle size={14} className="text-status-warning" /></div>,
  info: <div className="w-8 h-8 rounded-full bg-brand-blue/15 border border-brand-blue/30 flex items-center justify-center"><Zap size={14} className="text-brand-orange" /></div>,
  success: <div className="w-8 h-8 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center"><Info size={14} className="text-brand-orange" /></div>,
};

const borderByType: Record<NotifType, string> = {
  error: "border-l-4 border-l-status-error",
  warning: "border-l-4 border-l-status-warning",
  info: "border-l-4 border-l-brand-orange",
  success: "border-l-4 border-l-transparent",
};

const badgeColor: Record<string, string> = {
  Critical: "bg-status-error/20 text-status-error",
  Frequent: "bg-status-warning/20 text-status-warning",
  Occasional: "bg-brand-blue/20 text-brand-orange",
};

// Groups notifications the same way the design does ("Today",
// "Earlier this week", or an exact date) but from real timestamps.
function timeBucket(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const dayMs = 86_400_000;
  if (d.toDateString() === now.toDateString()) return "Today";
  if (now.getTime() - d.getTime() < 7 * dayMs) return "Earlier this week";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>("All");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [notifRes, statsRes] = await Promise.all([
      fetch("/api/notifications").then(r => r.json()),
      fetch("/api/notifications/stats").then(r => r.json()),
    ]);
    setNotifications(notifRes.notifications || []);
    setStats(statsRes?.error ? null : statsRes);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAsRead = useCallback(async (id: string) => {
    setBusyId(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
    } finally {
      setBusyId(null);
    }
  }, []);

  const dismiss = useCallback(async (id: string) => {
    setBusyId(id);
    const previous = notifications;
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dismissed: true }),
      });
      if (!res.ok) setNotifications(previous); // roll back on failure
    } finally {
      setBusyId(null);
    }
  }, [notifications]);

  const filtered = useMemo(
    () => notifications.filter(n => tabFilter[tab].includes(n.type)),
    [notifications, tab]
  );

  const grouped = useMemo(() => {
    const g: Record<string, Notification[]> = {};
    filtered.forEach(n => {
      const bucket = timeBucket(n.created_at);
      (g[bucket] = g[bucket] || []).push(n);
    });
    return g;
  }, [filtered]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: Notification feed ── */}
      <div className="flex-1 overflow-y-auto p-8 pr-6 scrollbar">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-3xl font-bold text-text-primary">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={async () => {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                await fetch("/api/notifications/read-all", { method: "POST" });
              }}
              className="text-xs text-brand-orange hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <p className="text-sm text-text-muted mb-6 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-status-error" />
          {loading ? "Loading alerts…" : `You have ${unreadCount} unread alert${unreadCount === 1 ? "" : "s"} requiring attention.`}
        </p>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-surface-2 border border-border rounded-lg p-1 w-fit mb-8">
          {(["All", "Critical", "Warnings", "System"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm px-5 py-1.5 rounded transition-colors ${
                tab === t ? "bg-surface text-text-primary font-medium" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-text-muted">No notifications here. You're caught up.</p>
        ) : (
          Object.entries(grouped).map(([bucket, items]) => (
            <div key={bucket} className="mb-8">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">{bucket}</p>
              <div className="space-y-3">
                {items.map(n => (
                  <div
                    key={n.id}
                    className={`bg-surface-2 border border-border rounded-xl overflow-hidden ${borderByType[n.type]} ${n.read ? "opacity-70" : ""}`}
                  >
                    <div className="flex gap-4 p-5">
                      <div className="flex-shrink-0 mt-0.5">{typeIcon[n.type]}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-text-primary mb-1">{n.title}</h3>
                        <p className="text-sm text-text-muted leading-relaxed mb-4">{n.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          {n.action_url && (
                            <Link
                              href={n.action_url}
                              onClick={() => !n.read && markAsRead(n.id)}
                              className="text-sm font-medium rounded-lg px-4 py-1.5 bg-brand-blue text-text-primary hover:opacity-90 transition-colors"
                            >
                              {n.action_label || "View"}
                            </Link>
                          )}
                          {!n.read && (
                            <button
                              disabled={busyId === n.id}
                              onClick={() => markAsRead(n.id)}
                              className="text-sm font-medium rounded-lg px-4 py-1.5 bg-surface border border-border text-text-primary hover:border-gray-500 disabled:opacity-40 transition-colors"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button
                            disabled={busyId === n.id}
                            onClick={() => dismiss(n.id)}
                            className="text-sm font-medium rounded-lg px-4 py-1.5 bg-surface border border-border text-text-primary hover:border-gray-500 disabled:opacity-40 transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── RIGHT: Notification Health sidebar ── */}
      <div className="w-72 flex-shrink-0 border-l border-border overflow-y-auto p-6 space-y-5 scrollbar">
        <h2 className="text-base font-semibold text-text-primary">Notification Health</h2>
        <p className="text-[10px] text-text-muted -mt-3">Trailing {stats?.windowDays ?? 30} days</p>

        {/* Uptime donut */}
        <div className="bg-surface-2 border border-border rounded-xl flex items-center justify-center py-8">
          <div className="relative">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1c2230" strokeWidth="10" />
              {stats?.uptime !== null && stats?.uptime !== undefined && (
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10"
                  strokeDasharray={`${(stats.uptime / 100) * 251.2} ${251.2}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)" />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-text-primary">
                {stats?.uptime !== null && stats?.uptime !== undefined ? `${stats.uptime}%` : "—"}
              </span>
              <span className="text-[8px] text-text-muted uppercase tracking-wide">SUCCESS RATE</span>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Summary Statistics</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-2 border border-border rounded-lg px-3 py-3">
              <p className="text-[10px] text-text-muted uppercase">Total Alerts</p>
              <p className="text-xl font-bold text-text-primary">{stats ? stats.totalAlerts.toLocaleString() : "—"}</p>
            </div>
            <div className="bg-surface-2 border border-border rounded-lg px-3 py-3">
              <p className="text-[10px] text-text-muted uppercase">Avg Resolve</p>
              <p className="text-xl font-bold text-text-primary">
                {stats?.avgResolveMinutes != null ? `${stats.avgResolveMinutes}m` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Common issues */}
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Common Issues</p>
          {stats && stats.commonIssues.length > 0 ? (
            <div className="space-y-2">
              {stats.commonIssues.map(issue => (
                <div key={issue.label} className="flex items-center justify-between bg-surface-2 border border-border rounded-lg px-3 py-2.5">
                  <span className="text-sm text-text-muted">{issue.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeColor[issue.badge] || badgeColor.Occasional}`}>
                    {issue.badge}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">No recurring issues in this window.</p>
          )}
        </div>
      </div>
    </div>
  );
}