// components/connections/ConnectionCard.tsx
"use client";

import { CheckCircle2, AlertCircle, PlugZap, Loader2 } from "lucide-react";

interface Props {
  platform: string;
  description: string;
  connected: boolean;
  status?: string; // "connected" | "error" | undefined (never connected)
  lastSync?: string;
  errorMsg?: string;
  loading?: boolean;
  onConnect: () => void;
}

export default function ConnectionCard({
  platform,
  description,
  connected,
  status,
  lastSync,
  errorMsg,
  loading,
  onConnect,
}: Props) {
  const hasError = status === "error";

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{platform}</h3>
          <p className="text-sm text-text-muted mt-1">{description}</p>
        </div>

        {loading ? (
          <span className="flex items-center gap-2 text-text-muted text-sm">
            <Loader2 size={16} className="animate-spin" />
          </span>
        ) : connected ? (
          <span className="flex items-center gap-2 text-status-success text-sm">
            <CheckCircle2 size={16} />
            Connected
          </span>
        ) : hasError ? (
          <span className="flex items-center gap-2 text-status-error text-sm">
            <AlertCircle size={16} />
            Error
          </span>
        ) : (
          <span className="flex items-center gap-2 text-status-error text-sm">
            <AlertCircle size={16} />
            Not Connected
          </span>
        )}
      </div>

      {connected && lastSync && (
        <p className="text-xs text-text-muted mt-5">
          Last Sync
          <br />
          {lastSync}
        </p>
      )}

      {hasError && errorMsg && (
        <p className="text-xs text-status-error mt-5">{errorMsg}</p>
      )}

      <button
        onClick={onConnect}
        className="mt-6 flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm text-white hover:opacity-90"
      >
        <PlugZap size={15} />
        {connected ? "Manage" : hasError ? "Reconnect" : "Connect"}
      </button>
    </div>
  );
}
