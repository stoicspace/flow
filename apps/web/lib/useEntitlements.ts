// ─────────────────────────────────────────────────────────────
// src/lib/useEntitlements.ts
// Client hook: "what can my account do?" from GET /api/me/entitlements.
//
// Results are cached in a module variable so several components on
// the same page share ONE request instead of each fetching.
//
// Note: unlimited numeric limits arrive as `null` (JSON has no
// Infinity) — check with `x == null`.
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";

export interface EntitlementsWire {
  effectivePlan: "free" | "pro" | "team" | "self_hosted";
  storedPlan: string;
  planStatus: string;
  trialEndsAt: string | null;
  trialActive: boolean;
  canDirectConnect: boolean;
  canUseCustomAiKey: boolean;
  canUseWorkflowAcl: boolean;
  maxWorkflows: number | null; // null = unlimited
  historyDays: number | null; // null = unlimited
  maxSeats: number | null; // null = unlimited
}

export interface EntitlementData {
  entitlements: EntitlementsWire;
  usage: { workflows: number; seats: number };
  plans: Record<
    string,
    {
      name: string;
      priceMonthlyUsd: number | null;
      limits: { maxWorkflows: number | null; historyDays: number | null; maxSeats: number | null };
      features: Record<string, boolean>;
    }
  >;
}

let cache: EntitlementData | null = null;

export function useEntitlements() {
  const [data, setData] = useState<EntitlementData | null>(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    fetch("/api/me/entitlements")
      .then((r) => (r.ok ? r.json() : null))
      .then((json: EntitlementData | null) => {
        if (!alive || !json?.entitlements) return;
        cache = json;
        setData(json);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { data, loading };
}
