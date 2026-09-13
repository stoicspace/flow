// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/import/page.tsx
// Main import page,wires everything together
// ─────────────────────────────────────────────────────────────

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Dropzone from "@/components/import/Dropzone";
import AIInsightCard from "@/components/import/AIInsightCard";
import DirectConnections from "@/components/import/DirectConnections";
import TrustBadges from "@/components/import/TrustBadges";
import PasteJsonModal from "@/components/import/PasteJsonModal";

export default function ImportPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [pasteModalOpen, setPasteModalOpen] = useState(false);

  async function processWorkflow(raw_json: any, suggestedName: string) {
    setStatus("processing");
    setStatusMessage("");
    try {
      // 1. Create workflow record
      const wfRes = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: suggestedName, platform: "n8n" }),
      }).then(r => r.json());

      if (wfRes.error) throw new Error(wfRes.error);

      // 2. Import snapshot (auto-detects platform)
      const snapRes = await fetch("/api/snapshots/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow_id: wfRes.workflow.id, raw_json }),
      }).then(r => r.json());

      if (snapRes.error) throw new Error(snapRes.error);

      setStatus("done");
      setStatusMessage(`"${wfRes.workflow.name}" is ready.`);
      setTimeout(() => router.push(`/workflows/${wfRes.workflow.id}`), 1200);
    } catch (e: any) {
      setStatus("error");
      setStatusMessage(e.message || "Could not import this workflow.");
    }
  }

  async function handleFile(file: File) {
    if (!file.name.endsWith(".json")) {
      setStatus("error");
      setStatusMessage("Only .json files are supported.");
      return;
    }
    const text = await file.text();
    try {
      const raw_json = JSON.parse(text);
      await processWorkflow(raw_json, raw_json.name || file.name.replace(".json", ""));
    } catch {
      setStatus("error");
      setStatusMessage("Could not parse this file as JSON.");
    }
  }

  async function handlePasteSubmit(raw: string) {
    setPasteModalOpen(false);
    try {
      const raw_json = JSON.parse(raw);
      await processWorkflow(raw_json, raw_json.name || "Pasted workflow");
    } catch {
      setStatus("error");
      setStatusMessage("Could not parse the pasted JSON.");
    }
  }

  return (
    <div className="px-8 py-12 max-w-6xl mx-auto">

      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-text-primary mb-4">Bring your logic to life</h1>
        <p className="text-base text-text-muted max-w-xl mx-auto leading-relaxed">
          Import your existing automation blueprints. FlowLens supports JSON structures
          and native connections to your favorite orchestration tools.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
        <Dropzone
          onFile={handleFile}
          onPasteRaw={() => setPasteModalOpen(true)}
          status={status}
          statusMessage={statusMessage}
        />

        <div className="space-y-4">
          <AIInsightCard />
          <DirectConnections />
        </div>
      </div>

      <TrustBadges />

      <PasteJsonModal
        open={pasteModalOpen}
        onClose={() => setPasteModalOpen(false)}
        onSubmit={handlePasteSubmit}
      />
    </div>
  );
}