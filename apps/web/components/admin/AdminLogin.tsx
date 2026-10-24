// ─────────────────────────────────────────────────────────────
// components/admin/AdminLogin.tsx
// Username/password form for /admin — credentials come from
// ADMIN_USERNAME / ADMIN_PASSWORD in .env.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-2xl border border-border bg-surface-2 p-8"
    >
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-orange/15 text-brand-orange">
          <Lock size={18} />
        </span>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Admin</h1>
          <p className="text-xs text-text-muted">FlowLens platform dashboard</p>
        </div>
      </div>

      <label className="mb-1.5 block text-xs text-text-muted">Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoFocus
        required
        className="mb-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-orange/50"
        placeholder="admin"
      />

      <label className="mb-1.5 block text-xs text-text-muted">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="mb-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-orange/50"
        placeholder="••••••••"
      />

      {error && <p className="mb-3 text-xs text-status-error">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition"
      >
        {busy ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
