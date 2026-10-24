// ─────────────────────────────────────────────────────────────
// /admin/incidents — recent incidents across all accounts.
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";

interface Row {
  id: string;
  status: string;
  error_message: string | null;
  detected_at: string;
  workflow_name: string;
  team_name: string;
}

export default function AdminIncidents() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/incidents")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setRows(json.incidents || []);
      })
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-text-muted">Loading incidents...</p>;
  if (error) return <p className="text-sm text-status-error">{error}</p>;

  const open = rows.filter((r) => r.status === "open").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Incidents</h1>
        <span className="text-sm text-text-muted">
          {open} open · {rows.length} recent
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-surface-2 text-xs text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Workflow</th>
              <th className="px-4 py-3 font-medium">Error</th>
              <th className="px-4 py-3 font-medium">Detected</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border bg-surface">
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === "open"
                        ? "bg-status-error/15 text-status-error"
                        : "bg-status-success/15 text-status-success"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-primary">{r.team_name}</td>
                <td className="px-4 py-3 text-text-secondary">{r.workflow_name}</td>
                <td className="max-w-[320px] truncate px-4 py-3 text-xs text-text-muted">
                  {r.error_message || "—"}
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">
                  {r.detected_at ? new Date(r.detected_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  No recent incidents. All quiet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
