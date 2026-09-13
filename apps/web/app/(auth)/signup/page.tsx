"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmpassword: "", team: "", role: "owner" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
  e.preventDefault();

  setError("");

  // Name validation
  if (!form.name.trim()) {
    setError("Please enter your name.");
    return;
  }

  // Team validation
  if (!form.team.trim()) {
    setError("Please enter a team name.");
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    setError("Please enter a valid email address.");
    return;
  }

  // Password length
  if (form.password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  // Password confirmation
  if (form.password !== form.confirmpassword) {
    setError("Passwords do not match.");
    return;
  }

  setLoading(true);

  try {
    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authErr) {
      throw new Error(authErr.message);
    }

    if (!data) {
      throw new Error("Unable to create user.");
    }

    const onboardRes = await fetch("/api/onboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: data.user?.id,
        displayName: form.name,
        teamName: form.team,
        email: form.email,
        password: form.password,
        role: form.role,
      }),
    });

    if (!onboardRes.ok) {
      throw new Error("Failed to create workspace.");
    }

    router.push("/dashboard");
  } catch (err: any) {
    switch (err.message) {
      case "User already registered":
        setError("An account with this email already exists.");
        break;

      case "Email rate limit exceeded":
        setError("Too many signup attempts. Please try again later.");
        break;

      case "Password should be at least 6 characters":
        setError("Password must be at least 6 characters.");
        break;

      case "Invalid login credentials":
        setError("Invalid email or password.");
        break;

      default:
        setError(err.message || "Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-sm bg-surface-2 border border-border rounded-lg p-8">
        <h1 className="text-xl font-semibold text-text-primary mb-1">Create your account</h1>
        <p className="text-xs text-text-muted mb-6">Start debugging your automations</p>

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-orange/50"
          />

          <input
            type="text"
            placeholder="Team name"
            value={form.team}
            onChange={e => setForm(prev => ({ ...prev, team: e.target.value }))}
            required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-orange/50"
          />
          <select
            value={form.role}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, role: e.target.value }))
            }
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-orange/50"
          >
            <option value="member">Member</option>
            <option value="owner">Owner</option>
          </select>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-orange/50"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
            required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-orange/50"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={form.confirmpassword}
            onChange={e => setForm(prev => ({ ...prev, confirmpassword: e.target.value }))}
            required
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-orange/50"
          />

          {error && (
            <div className="rounded border border-status-error/30 bg-status-error/10 px-3 py-2 text-xs text-status-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange text-white rounded py-2 text-sm font-medium disabled:opacity-60 hover:opacity-90 transition-opacity "
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-center text-text-muted mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-brand-orange hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}