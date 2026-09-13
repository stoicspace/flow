// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/workflows/[id]/incidents/[incidentId]/page.tsx
// Main incident analysis page
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import TimelineEvent from "@/components/incident/TimelineEvent";
import AIIntelligenceReport from "@/components/incident/AIIntelligenceReport";
import { Wand } from "lucide-react";

interface Incident {
  id: string;
  workflow_id: string;
  error_message: string | null;
  problem: string | null;
  root_cause: string | null;
  confidence: number | null;
  business_impact: string | null;
  impact_summary: string | null;
  what_changed: string | null;
  execution_evidence: string | null;
  recovery_steps: string[] | null;
  suggested_fix: { description: string; node_id?: string; field?: string } | null;
  detected_at: string;
}

interface ChangeLogEntry {
  id: string;
  action: string;
  created_at: string;
  diff_summary?: any;
  profiles?: { display_name: string };
}

export default function IncidentAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;
  const incidentId = params.incidentId as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [history, setHistory] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingFix, setApplyingFix] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    async function load() {
      const [incidentRes, historyRes] = await Promise.all([
        fetch(`/api/incidents/${incidentId}`).then(r => r.json()),
        fetch(`/api/history?workflow_id=${workflowId}`).then(r => r.json()),
      ]);

      setIncident(incidentRes.incident);
      setHistory(historyRes.history || []);

      // If not yet analysed, trigger AI analysis automatically
      if (incidentRes.incident && !incidentRes.incident.root_cause) {
        const analyseRes = await fetch(`/api/incidents/${incidentId}/analyse`, {
          method: "POST",
        }).then(r => r.json());

        if (analyseRes.analysis) {
          setIncident(prev =>
            prev
              ? {
                  ...prev,
                  problem: analyseRes.analysis.problem,
                  root_cause: analyseRes.analysis.root_cause,
                  confidence: analyseRes.analysis.confidence,
                  business_impact: analyseRes.analysis.business_impact,
                  impact_summary: analyseRes.analysis.impact_summary,
                  what_changed: analyseRes.analysis.what_changed,
                  execution_evidence: analyseRes.analysis.execution_evidence,
                  recovery_steps: analyseRes.analysis.recovery_steps,
                  suggested_fix: analyseRes.analysis.suggested_fix,
                }
              : prev
          );
        }
      }

      setLoading(false);
    }
    load();
  }, [incidentId, workflowId]);

  async function handleApplyFix() {
    setApplyingFix(true);
    try {
      await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      router.push(`/workflows/${workflowId}`);
    } finally {
      setApplyingFix(false);
    }
  }

  async function handleRestore() {
    if (!incident) return;
    setRestoring(true);
    try {
      // Restoring uses the workflow's last known-good snapshot
      const snapshotsRes = await fetch(
        `/api/snapshots?workflow_id=${workflowId}`
      ).then(r => r.json());
      const lastGood = snapshotsRes.snapshots?.find(
        (s: any) => s.execution_status === "success"
      );
      if (!lastGood) return;

      await fetch("/api/snapshots/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot_id: lastGood.id, workflow_id: workflowId }),
      });

      await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });

      router.push(`/workflows/${workflowId}`);
    } finally {
      setRestoring(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-text-muted text-sm">Analyzing incident...</div>;
  }

  if (!incident) {
    return <div className="p-8 text-status-error text-sm">Incident not found.</div>;
  }

  // Derive impact level from confidence for display
  const impactLevel: "low" | "medium" | "high" =
    (incident.confidence ?? 0) > 0.75 ? "high" : (incident.confidence ?? 0) > 0.4 ? "medium" : "low";

  return (
    <div className="grid grid-cols-[1fr_420px] gap-8 p-8 max-w-7xl">

      {/* Left,Timeline */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-1">Incident Timeline</h1>
        <p className="text-sm text-text-muted mb-8">
          Tracing the cascade of failures across your architecture.
        </p>

        <div className="relative pl-[52px] space-y-8 border-l border-border-light ml-[18px]">
          {/* Healthy state,most recent successful run before incident */}
          <TimelineEvent
            time="Before incident"
            title="Workflow healthy"
            description="All nodes reported 100% success rate prior to this incident."
            type="healthy"
            badge="STEADY STATE"
          />

          {/* Change log entries leading up to failure */}
          {history.slice(0, 3).map(h => (
            <TimelineEvent
              key={h.id}
              time={new Date(h.created_at).toLocaleString(undefined, {
                hour: "2-digit", minute: "2-digit",
              })}
              title={h.action.replace(/_/g, " ")}
              description={`Change made by ${h.profiles?.display_name || "system"}.`}
              type="change"
            />
          ))}

          {/* The failure itself — AI interpretation attached once analysed */}
          <TimelineEvent
            time={new Date(incident.detected_at).toLocaleString(undefined, {
              hour: "2-digit", minute: "2-digit",
            })}
            title="Workflow failed"
            description={incident.error_message || "Execution failed without a specific error message."}
            type="error"
            errorDetail={incident.error_message || "Unknown error"}
            aiInterpretation={
              incident.root_cause
                ? `${incident.root_cause}${incident.what_changed ? ` ${incident.what_changed}` : ""}`
                : undefined
            }
          />

          {/* Recovery — only shown once AI analysis has produced steps */}
          {incident.recovery_steps && incident.recovery_steps.length > 0 && (
            <TimelineEvent
              time="Recommended next"
              title="Recovery"
              description={incident.recovery_steps.join(" ")}
              type="ai"
              badge="AI RECOMMENDED"
            />
          )}
        </div>
      </div>

      {/* Right,AI Intelligence Report */}
      <div>
        {incident.root_cause ? (
          <AIIntelligenceReport
            problem={incident.problem || undefined}
            rootCause={incident.root_cause}
            confidence={incident.confidence || 0}
            impact={impactLevel}
            businessImpact={incident.business_impact || undefined}
            whatChanged={incident.what_changed || undefined}
            explanation={incident.impact_summary || ""}
            executionEvidence={incident.execution_evidence || undefined}
            recoverySteps={incident.recovery_steps || []}
            actions={[
              {
                icon: "fix",
                title: "Apply Automatic Fix",
                description: incident.suggested_fix?.description || "No automated fix available.",
                onClick: handleApplyFix,
                loading: applyingFix,
              },
              {
                icon: "rollback",
                title: "Rollback to last working version",
                description: "Restore workflow to its last known-good snapshot.",
                onClick: handleRestore,
                loading: restoring,
              },
            ]}
            onApplyFix={handleApplyFix}
            onRestore={handleRestore}
            applyingFix={applyingFix}
            restoring={restoring}
          />
        ) : (
          <div className="bg-surface-2 border border-border rounded-xl p-5">
            <p className="text-sm text-text-muted">Running AI analysis...</p>
          </div>
        )}
      </div>

    </div>
  );
}