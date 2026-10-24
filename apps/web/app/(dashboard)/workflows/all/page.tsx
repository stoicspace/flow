"use client"
import AiRecommendation from "@/components/ui/ai-recommendation/page";
import Card from "@/components/ui/card/page";
import SystemHealthCard from "@/components/ui/system-health-card/page";
import RecentActivityFeed from "@/components/ui/recent-activity-feed/page";
import Link from "next/link";
import { useState, useEffect } from "react";
import { History, CheckCircle, AlertTriangle, Lock } from "lucide-react";
import { useEntitlements } from "@/lib/useEntitlements";
import { PlanBanner } from "@/components/plans/PlanGate";
const statusPriority: Record<string, number> = {
  failing: 0,
  degraded: 1,
  unknown: 2,
  healthy: 3,
};
export default function AllWorkflows() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<any[]>([]);
  const { data: entData } = useEntitlements();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";

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

  // Plan limits (null max = unlimited plan, e.g. self-hosted).
  const maxWorkflows = entData?.entitlements.maxWorkflows ?? null;
  const usedWorkflows = entData?.usage.workflows ?? workflows.length;
  const atCap = maxWorkflows != null && usedWorkflows >= maxWorkflows;
  const overCap = maxWorkflows != null && usedWorkflows > maxWorkflows;

  return (
    <div className="flex min-h-screen bg-surface  ">


      <div className="flex flex-col flex-1">

        <main className="flex-1 p-8  ">
          {loading ? (
            <p className="text-text-muted text-sm px-5">Loading workflows...</p>
          ) : (
            <div>
              {overCap && (
                <PlanBanner
                  message={`Your plan allows ${maxWorkflows} workflow${maxWorkflows === 1 ? "" : "s"} and you have ${usedWorkflows}. This workspace is read-only until you delete workflows or upgrade your plan.`}
                />
              )}
              <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Workflows</h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Loading..." : `${workflows.length} workflow${workflows.length === 1 ? "" : "s"} · ${
              workflows.filter(w => w.latest_ai_summary || w.latest_ai_review).length
            } reviewed by AI`}
            {maxWorkflows != null && ` · ${usedWorkflows} of ${maxWorkflows} on your plan`}
          </p>
        </div>
        <Link
          href={atCap ? "/pricing" : "/import"}
          className="text-sm bg-brand-orange text-text-primary font-medium rounded-lg px-4 py-2 hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
        >
          {atCap && <Lock size={14} />}
          {atCap ? "Limit reached · Upgrade" : "Import New"}
        </Link>
      </div>
            <div className="grid grid-cols-2 ">
              
              {sortedWorkflows.map(wf => {

                const hasIncident = incidents.some(
                  incident =>
                    incident.workflow_id === wf.id
                );

                const complexity =
                  wf.latest_ai_summary?.complexity;

                const needsAttention =
                  wf.status === "failing" ||
                  wf.status === "degraded" ;
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
                      hasIncident
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
                href={atCap ? "/pricing" : "/import"}
              />
            </div>
          </div>
          )}
          
        </main>
        
      </div>
      
    </div>
  )

}