// ─────────────────────────────────────────────────────────────
// /admin — Overview: headline numbers across the whole platform.
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";

interface Stats {
  accounts: number;
  plans: { free: number; pro: number; team: number; self_hosted: number };
  workflows: number;
  users: number;
  openIncidents: number;
  waitlist: number;
  signups7d: number;
  signups30d: number;
}

function Card({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-5">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setStats(json);
      })
      .catch((e) => setError(e.message || "Failed to load"));
  }, []);

  if (error) return <p className="text-sm text-status-error">{error}</p>;
  if (!stats) return <p className="text-sm text-text-muted">Loading...</p>;

  const planTotal = Math.max(
    1,
    stats.plans.free + stats.plans.pro + stats.plans.team + stats.plans.self_hosted
  );
  const planBars: [string, number, string][] = [
    ["Free", stats.plans.free, "bg-text-muted"],
    ["Pro", stats.plans.pro, "bg-brand-orange"],
    ["Team", stats.plans.team, "bg-status-success"],
    ["Self-hosted", stats.plans.self_hosted, "bg-indigo-400"],
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Overview</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card label="Accounts" value={stats.accounts} />
        <Card label="Users" value={stats.users} />
        <Card label="Workflows tracked" value={stats.workflows} />
        <Card label="Open incidents" value={stats.openIncidents} />
        <Card label="Signups · 7 days" value={stats.signups7d} />
        <Card label="Signups · 30 days" value={stats.signups30d} />
        <Card label="Waitlist" value={stats.waitlist} />
      </div>

      <div className="mt-8 rounded-xl border border-border bg-surface-2 p-5">
        <p className="mb-4 text-sm font-semibold text-text-primary">
          Plans distribution
        </p>
        <div className="space-y-3">
          {planBars.map(([name, count, color]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-text-secondary">{name}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{ width: `${(count / planTotal) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs text-text-muted">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
