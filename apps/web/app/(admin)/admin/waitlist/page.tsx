// ─────────────────────────────────────────────────────────────
// /admin/waitlist — landing-page waitlist signups.
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";

interface Row {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminWaitlist() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/waitlist")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setRows(json.waitlist || []);
      })
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-text-muted">Loading waitlist...</p>;
  if (error) return <p className="text-sm text-status-error">{error}</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Waitlist</h1>
        <span className="text-sm text-text-muted">{rows.length} signups</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-xs text-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Signed up</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border bg-surface">
                <td className="px-4 py-3 text-text-primary">{r.email}</td>
                <td className="px-4 py-3 text-xs text-text-muted">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-text-muted">
                  No waitlist signups yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
