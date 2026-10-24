// ─────────────────────────────────────────────────────────────
// /admin/accounts — every account, its plan, and usage vs limit.
// Inline plan editor: change plan / status / trial end date.
// ─────────────────────────────────────────────────────────────
"use client";

import { useCallback, useEffect, useState } from "react";

interface TeamRow {
  id: string;
  name: string;
  plan: "free" | "pro" | "team" | "self_hosted";
  plan_status: "active" | "trialing" | "past_due" | "canceled";
  trial_ends_at: string | null;
  created_at?: string;
  workflows: number;
  seats: number;
  platforms: { platform: string; status: string }[];
}

const PLANS = ["free", "pro", "team", "self_hosted"] as const;
const STATUSES = ["active", "trialing", "past_due", "canceled"] as const;

// Caps for the usage bar (mirrors plans.ts — display only).
const CAPS: Record<string, number | null> = {
  free: 1,
  pro: 10,
  team: 20,
  self_hosted: null, // unlimited
};

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
  self_hosted: "Self-hosted",
};

export default function AdminAccounts() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/teams");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setTeams(json.teams || []);
    } catch (e: any) {
      setError(e.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updatePlan(team: TeamRow, patch: Record<string, unknown>) {
    setSavingId(team.id);
    setError("");
    try {
      const res = await fetch("/api/admin/set-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          plan: patch.plan ?? team.plan,
          planStatus: patch.planStatus ?? team.plan_status,
          trialEndsAt: "trialEndsAt" in patch ? patch.trialEndsAt : team.trial_ends_at,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setTeams((prev) =>
        prev.map((t) => (t.id === team.id ? { ...t, ...json.team } : t))
      );
    } catch (e: any) {
      setError(e.message || "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  const visible = teams.filter((t) => {
    const matchesFilter = filter === "all" || t.plan === filter;
    const matchesSearch =
      !search || t.name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <p className="text-sm text-text-muted">Loading accounts...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Accounts</h1>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name..."
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-orange/50"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary outline-none focus:border-brand-orange/50"
          >
            <option value="all">All plans</option>
            {PLANS.map((p) => (
              <option key={p} value={p}>
                {PLAN_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-status-error">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-surface-2 text-xs text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Workflows</th>
              <th className="px-4 py-3 font-medium">Seats</th>
              <th className="px-4 py-3 font-medium">Connections</th>
              <th className="px-4 py-3 font-medium">Trial ends</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => {
              const cap = CAPS[t.plan];
              const pct = cap ? Math.min(100, (t.workflows / cap) * 100) : 0;
              const over = cap != null && t.workflows > cap;
              return (
                <tr key={t.id} className="border-t border-border bg-surface">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{t.name || "—"}</p>
                    <p className="text-xs text-text-muted">{t.id.slice(0, 8)}…</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={t.plan}
                      disabled={savingId === t.id}
                      onChange={(e) => updatePlan(t, { plan: e.target.value })}
                      className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs text-text-primary outline-none focus:border-brand-orange/50 disabled:opacity-50"
                    >
                      {PLANS.map((p) => (
                        <option key={p} value={p}>
                          {PLAN_LABEL[p]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={t.plan_status}
                      disabled={savingId === t.id}
                      onChange={(e) => updatePlan(t, { planStatus: e.target.value })}
                      className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs text-text-primary outline-none focus:border-brand-orange/50 disabled:opacity-50"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className={`h-full rounded-full ${over ? "bg-status-error" : "bg-brand-orange"}`}
                          style={{ width: `${cap ? pct : 100}%` }}
                        />
                      </div>
                      <span className={`text-xs ${over ? "text-status-error" : "text-text-muted"}`}>
                        {t.workflows}
                        {cap != null ? `/${cap}` : ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {t.seats}
                    {t.plan === "team" ? "/3" : ""}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {t.platforms.length
                      ? t.platforms.map((p) => p.platform).join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {t.plan_status === "trialing" ? (
                      <input
                        type="date"
                        defaultValue={
                          t.trial_ends_at ? t.trial_ends_at.slice(0, 10) : ""
                        }
                        disabled={savingId === t.id}
                        onChange={(e) =>
                          updatePlan(t, {
                            trialEndsAt: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          })
                        }
                        className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs text-text-primary outline-none focus:border-brand-orange/50"
                      />
                    ) : (
                      <span className="text-xs text-text-muted">
                        {t.trial_ends_at ? t.trial_ends_at.slice(0, 10) : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                  No accounts match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-text-muted">
        Plan changes apply immediately. Downgrading never deletes data: over-cap
        workflows become read-only, old history is hidden (kept), and sync stops.
      </p>
    </div>
  );
}
