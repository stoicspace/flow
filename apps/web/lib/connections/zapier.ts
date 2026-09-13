// src/lib/connections/zapier.ts
//
// Zapier has no pull API equivalent to n8n's /api/v1/workflows or Make's
// /scenarios for a third party to list a user's Zaps or run history with an
// API key. The only way to get that data is if FlowLens is published as a
// Zapier Partner integration with OAuth (`zap:all` scope) — a much bigger
// lift than a "paste your API key" form, and it still wouldn't give you run
// history, just Zap definitions.
//
// So Zapier support is PUSH, not PULL: the user adds a native "Webhooks by
// Zapier" action as the last step of each Zap (and on the error path too,
// via Zapier's built-in error handling), pointed at your webhook URL below.
// There is no testConnection()/getWorkflows() to write here — nothing to
// call. generateZapierWebhookUrl() is the entire "integration."

import { randomBytes } from "crypto";

export function generateWebhookSecret(): string {
  return randomBytes(24).toString("hex");
}

export function buildZapierWebhookUrl(
  teamId: string,
  webhookSecret: string
): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier/${teamId}?secret=${webhookSecret}`;
}

export interface ZapierWebhookPayload {
  zap_id: string; // user names this in their Zap's webhook step config
  zap_name: string;
  status: "success" | "error";
  error_message?: string;
  ran_at: string; // ISO string
}
