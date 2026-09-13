"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center text-text-primary">
      <div className="w-full max-w-sm bg-surface-2 border border-border rounded-lg p-8">
        <h1 className="text-xl font-semibold mb-6">Sign in to FlowLens</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm" />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm" />
          {error && <p className="text-status-error text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-brand-orange text-white rounded py-2 text-sm font-medium disabled:opacity-60">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-xs text-center text-text-muted mt-4">
          No account? <a href="/signup" className="text-brand-orange">Sign up</a>
        </p>
      </div>
    </div>
  );
}