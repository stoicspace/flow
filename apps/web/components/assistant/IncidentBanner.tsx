// ============================================================
// AI ASSISTANT OVERLAY
// Copy each block to its file path
// ============================================================

// ─────────────────────────────────────────────────────────────
// src/components/assistant/IncidentBanner.tsx
// Floating banner shown on the graph behind the chat panel
// ─────────────────────────────────────────────────────────────

interface Props {
  incidentId: string;
  statusLabel: string;
}

// Shared helper so every caller builds the same context string shape that
// AIAssistantPanel / buildWorkflowContext (in /api/chat) expect — keeps the
// banner, the page, and the Copilot's server-side context in sync instead of
// each hand-rolling its own format.
export function buildIncidentContext(
  workflow: { name?: string; platform?: string; status?: string } | null | undefined,
  incident?: { id?: string; statusLabel?: string } | null
): string {
  const parts: string[] = [];
  if (workflow) {
    parts.push(`Workflow: ${workflow.name || "Unknown"}. Platform: ${workflow.platform || "unknown"}. Status: ${workflow.status || "unknown"}.`);
  }
  if (incident?.id) {
    parts.push(`Active incident: ${incident.id}${incident.statusLabel ? ` — ${incident.statusLabel}` : ""}.`);
  }
  return parts.join(" ");
}

export default function IncidentBanner({ incidentId, statusLabel }: Props) {
  return (
    <div className="absolute top-6 left-6 bg-surface-2 border border-status-error/30 rounded-xl px-5 py-3.5 max-w-xs">
      <p className="text-sm font-semibold text-status-error">Incident: {incidentId}</p>
      <p className="text-xs text-text-muted mt-0.5">{statusLabel}</p>
      <p className="text-[11px] text-text-muted mt-2">Just now</p>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────
// USAGE EXAMPLE,how to drop this into the workflow detail page
// Add this inside src/app/(dashboard)/workflows/[id]/page.tsx
// ─────────────────────────────────────────────────────────────

/*
import { useState } from "react";
import AIAssistantPanel from "@/components/assistant/AIAssistantPanel";
import IncidentBanner, { buildIncidentContext } from "@/components/assistant/IncidentBanner";

// Inside your component:
const [assistantOpen, setAssistantOpen] = useState(false);

// Add a trigger button somewhere in your header:
<button
  onClick={() => setAssistantOpen(true)}
  className="text-xs bg-surface-2 border border-border rounded-lg px-4 py-2 text-text-muted hover:text-text-primary hover:border-brand-orange/40 transition-colors"
>
  Ask AI Assistant
</button>

{activeIncident && (
  <IncidentBanner incidentId={activeIncident.id} statusLabel={activeIncident.statusLabel} />
)}

// Render the panel conditionally — use buildIncidentContext so the banner's
// incident and the Copilot's context always agree with each other:
{assistantOpen && (
  <AIAssistantPanel
    workflowId={workflowId}
    snapshotId={selectedSnapshotId}
    incidentContext={buildIncidentContext(workflow, activeIncident)}
    onClose={() => setAssistantOpen(false)}
    onApplyFix={async () => {
      // call your real fix-apply logic here
    }}
    onRestore={async () => {
      // call /api/snapshots/restore here
    }}
    onOpenCompare={() => {
      router.push(`/workflows/${workflowId}/compare?from=X&to=Y`);
    }}
  />
)}
*/