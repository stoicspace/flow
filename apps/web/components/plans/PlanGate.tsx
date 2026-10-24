// ─────────────────────────────────────────────────────────────
// components/plans/PlanGate.tsx
// Small pieces used to show a feature as LOCKED (never hidden)
// with a clear "Requires <Plan>" upgrade prompt.
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

// Amber banner for "you're blocked" messages (over-cap, etc).
export function PlanBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
      {message}
    </div>
  );
}

// Inline "Requires X plan" chip with an upgrade link.
export function RequiresPlan({ planName }: { planName: string }) {
  return (
    <Link
      href="/pricing"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-text-secondary hover:border-brand-orange/50 transition"
    >
      <Lock size={12} />
      Requires {planName} plan · Upgrade
    </Link>
  );
}
