// app/(dashboard)/connections/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import ConnectionCard from "@/components/connections/ConnectionCard";
import ConnectionModal from "@/components/connections/ConnectionModal";

interface ConnectionRow {
  id: string;
  name: string; // this is the platform ("n8n" | "make" | "zapier"), see GET /api/connections
  status: string;
  lastSync: string | null;
  errorMsg: string | null;
}

const PLATFORM_META: Record<string, { label: string; description: string }> = {
  n8n: { label: "n8n", description: "Connect self hosted or cloud n8n." },
  make: { label: "Make", description: "Sync Make scenarios." },
  zapier: { label: "Zapier", description: "Import your Zaps." },
};

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const loadConnections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/connections");
      const json = await res.json();
      setConnections(json.connections || []);
    } catch {
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  async function handleSync() {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/connections/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Sync failed");
      setSyncMessage(
        `Synced: ${json.workflowsImported} workflows, ${json.executionsProcessed} executions, ${json.incidentsCreated} new incidents.`
      );
      await loadConnections();
    } catch (e: any) {
      setSyncMessage(e.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  const platforms = Object.keys(PLATFORM_META);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl text-text-primary font-semibold">Integrations</h1>

        <button
          onClick={handleSync}
          disabled={syncing || connections.length === 0}
          className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm text-text-primary hover:border-brand-orange/40 disabled:opacity-50 transition"
        >
          {syncing ? "Syncing..." : "Sync now"}
        </button>
      </div>

      {syncMessage && (
        <p className="mb-6 text-sm text-text-muted">{syncMessage}</p>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const meta = PLATFORM_META[platform];
          const row = connections.find(
            (c) => c.name?.toLowerCase() === platform
          );

          return (
            <ConnectionCard
              key={platform}
              platform={meta.label}
              description={meta.description}
              connected={!!row && row.status === "connected"}
              status={row?.status}
              lastSync={row?.lastSync ?? undefined}
              errorMsg={row?.errorMsg ?? undefined}
              loading={loading}
              onConnect={() => {
                setSelectedPlatform(platform);
                setOpen(true);
              }}
            />
          );
        })}
      </div>

      <ConnectionModal
        platform={selectedPlatform}
        open={open}
        onClose={() => setOpen(false)}
        onConnected={() => {
          setOpen(false);
          loadConnections();
        }}
      />
    </div>
  );
}
