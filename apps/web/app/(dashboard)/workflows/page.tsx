// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/workflows/page.tsx
// Main workflow list — AI score / complexity / review status / summary.
// (Was previously a mistaken duplicate of the import page; fixed here.)
// ─────────────────────────────────────────────────────────────

"use client";
import Card from "@/components/ui/card/page";
import Link from "next/link";
import { useState, useEffect } from "react";
import { History, AlertTriangle } from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  platform: string;
  status: "healthy" | "degraded" | "failing" | "unknown";
  last_snapshot_at?: string;
  latest_ai_summary?: { complexity: "low" | "medium" | "high"; summary: string } | null;
  latest_ai_review?: { overall_risk: string } | null;
}

interface Incident { id: string; workflow_id: string; }

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/workflows").then(r => r.json()),
      fetch("/api/incidents?status=open").then(r => r.json()),
    ]).then(([wfData, incData]) => {
      setWorkflows(wfData.workflows || []);
      setIncidents(incData.incidents || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Workflows</h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Loading..." : `${workflows.length} workflow${workflows.length === 1 ? "" : "s"} · ${
              workflows.filter(w => w.latest_ai_summary || w.latest_ai_review).length
            } reviewed by AI`}
          </p>
        </div>
        <Link
          href="/import"
          className="text-sm bg-brand-orange text-text-primary font-medium rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Import New
        </Link>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm px-5">Loading workflows...</p>
      ) : (
        <div className="grid grid-cols-2">
          {[...workflows]
            .sort((a, b) => {
              const priority: Record<string, number> = { failing: 0, degraded: 1, unknown: 2, healthy: 3 };
              return (priority[a.status] ?? 2) - (priority[b.status] ?? 2);
            })
            .map(wf => {
              const hasIncident = incidents.some(i => i.workflow_id === wf.id);
              return (
                <Card
                  key={wf.id}
                  title={wf.name}
                  description={wf.platform}
                  href={`/workflows/${wf.id}`}
                  status={{
                    label: wf.status === "failing" ? "Needs Attention" : "Healthy",
                    color: wf.status === "failing" ? "error" : "success",
                  }}
                  aiBadges={{
                    complexity: wf.latest_ai_summary?.complexity,
                    reviewStatus: wf.latest_ai_review ? `${wf.latest_ai_review.overall_risk} risk` : undefined,
                    summary: wf.latest_ai_summary?.summary,
                  }}
                  button={hasIncident ? {
                    label: "Investigate",
                    color: "error",
                    icon: <AlertTriangle size={14} />,
                  } : undefined}
                  footer={!hasIncident ? (
                    <span className="flex items-center gap-1.5">
                      <History size={14} />
                      {wf.last_snapshot_at
                        ? `Last seen ${new Date(wf.last_snapshot_at).toLocaleString()}`
                        : "No snapshots yet"}
                    </span>
                  ) : undefined}
                />
              );
            })}
          <Card variant="create" href="/import" />
        </div>
      )}
    </div>
  );
}
