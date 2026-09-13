"use client";

import AiRecommendation from "@/components/ui/ai-recommendation/page";
import Card from "@/components/ui/card/page";
import SystemHealthCard from "@/components/ui/system-health-card/page";
import RecentActivityFeed from "@/components/ui/recent-activity-feed/page";
import AIFindings from "@/components/dashboard/AIFindings";
import WorkflowHealthSummary from "@/components/dashboard/WorkflowHealthSummary";
import RecentReviews from "@/components/dashboard/RecentReviews";
import Link from "next/link";
import { useState, useEffect } from "react";
import { History, AlertTriangle } from "lucide-react";

const statusPriority: Record<string, number> = {
  failing: 0,
  degraded: 1,
  unknown: 2,
  healthy: 3,
};

export default function Home() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<any[]>([]);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning."
      : hour < 18
        ? "Good afternoon."
        : "Good evening.";

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [wfRes, incRes] = await Promise.all([
          fetch("/api/workflows"),
          fetch("/api/incidents?status=open"),
        ]);

        const wfData = await wfRes.json();
        const incData = await incRes.json();

        setWorkflows(wfData.workflows || []);
        setIncidents(incData.incidents || []);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  /*
   * Sort workflows by health priority.
   *
   * failing  → first
   * degraded → second
   * unknown  → third
   * healthy  → last
   */
  const sortedWorkflows = [...workflows].sort((a, b) => {
    return (
      (statusPriority[a.status] ?? 2) -
      (statusPriority[b.status] ?? 2)
    );
  });

  /*
   * Count workflows that actually need attention.
   * This is independent from incident count.
   */
  const needingAttention = workflows.filter(
    wf =>
      wf.status === "failing" ||
      wf.status === "degraded"
  ).length;

  return (
    <div className="flex min-h-screen bg-surface">

      <div className="flex flex-col flex-1">

        <main className="flex-1 p-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-text-primary">
              {greeting}
            </h1>

            <p className="text-inactive text-sm pt-1">
              {loading
                ? "Loading workflow health..."
                : needingAttention > 0
                  ? `${needingAttention} workflow${needingAttention > 1 ? "s" : ""
                  } need attention.`
                  : "All workflows are healthy."}
            </p>
          </div>

          {/* Main layout */}
          <div className="flex gap-6 h-full">

            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-6 flex-1 min-w-0">

              {/* AI Recommendation */}
              <AiRecommendation />

              {/* Workflow Health Summary */}


              {/* Workflows */}
              <div>

                <div className="flex items-center justify-between mb-2 px-5">
                  <h3 className="text-text-primary font-medium">
                    Your workflows
                  </h3>

                  <Link
                    href="/workflows/all"
                    className="text-sm text-text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>

                {loading ? (
                  <p className="text-text-muted text-sm px-5">
                    Loading workflows...
                  </p>
                ) : (
                  <div className="grid grid-cols-2">

                    {sortedWorkflows.slice(0, 3).map(wf => {

                      const hasIncident = incidents.some(
                        incident =>
                          incident.workflow_id === wf.id
                      );

                      const complexity =
                        wf.latest_ai_summary?.complexity;

                      const needsAttention =
                        wf.status === "failing" ||
                        wf.status === "degraded";
                      const warning = wf.status === "unknown";

                      return (
                        <Card
                          key={wf.id}
                          title={wf.name}
                          description={wf.platform}
                          href={`/workflows/${wf.id}`}

                           status={{
                            label: needsAttention
                              ? "Needs Attention" : warning ? "Uknown"
                              : "Healthy",

                            color:
                              needsAttention
                                ? "error" : warning ? "warning"
                                : wf.status === "degraded"
                                  ? "warning"
                                  : "success",
                          }}

                          button={
                            hasIncident || needsAttention
                              ? {
                                label: "Investigate",
                                color: "error",
                                icon: (
                                  <AlertTriangle size={14} />
                                ),
                              }
                              : undefined
                          }

                          footer={
                            !hasIncident ? (
                              <span className="flex items-center gap-1.5">
                                <History size={14} />

                                {wf.last_snapshot_at
                                  ? `Last seen ${new Date(
                                    wf.last_snapshot_at
                                  ).toLocaleString()}`
                                  : "No snapshots yet"}

                                {complexity &&
                                  ` · ${complexity} complexity`}
                              </span>
                            ) : undefined
                          }
                        />
                      );
                    })}

                    <Card
                      variant="create"
                      href="/import"
                    />

                  </div>
                )}
              </div>

              {/* AI Findings + Recent Reviews */}
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-72 flex-shrink-0 overflow-y-auto pr-2">

              <RecentActivityFeed />

              <SystemHealthCard key="as"
                workflows={workflows}
                loading={loading}
              />

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}