// ─────────────────────────────────────────────────────────────
// src/components/workflow/AIInsightsPanel.tsx
// Right panel — AI understanding of the workflow: summary, complexity,
// risks, deployment readiness, optimization opportunities, documentation,
// plus system health, dependencies, and recent changes.
// ─────────────────────────────────────────────────────────────

"use client";

import WorkflowDependencies from "./WorkflowDependencies";
import AIScoreCard from "./AIScoreCard";
import DeploymentReadiness from "./DeploymentReadiness";
import OptimizationPanel from "./OptimizationPanel";
import WorkflowDocumentation from "./WorkflowDocumentation";

interface DeploymentCheck {
  score: number;
  status: "ready" | "needs_review" | "blocked";
  blocking_issues: string[];
  warnings: string[];
}

interface OptimizationOpportunity {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  node_id?: string;
}

interface WorkflowDoc {
  title: string;
  overview: string;
  sections: Array<{ heading: string; content: string }>;
  node_docs: Array<{ node_id: string; label: string; purpose: string }>;
}

interface Props {
  workflowName: string;
  latencyMs?: number;
  systemHealth: "healthy" | "degraded" | "failing" | "unknown";
  dependencies: string[];
  recentChanges: Array<{ label: string; time: string }>;

  // AI summary + complexity + risks
  aiSummary?: string;
  aiComplexity?: "low" | "medium" | "high";
  aiRisks?: string[];
  aiSummaryLoading?: boolean;

  // Deployment readiness
  deploymentCheck?: DeploymentCheck | null;
  deploymentLoading?: boolean;
  onRunDeploymentCheck?: () => void;

  // Optimization opportunities
  optimizations?: OptimizationOpportunity[];
  optimizationsLoading?: boolean;
  onRunOptimizationScan?: () => void;

  // Documentation
  documentation?: WorkflowDoc | null;
  documentationLoading?: boolean;
  onGenerateDocumentation?: () => void;
}

const healthStyle: Record<string, string> = {
  healthy: "text-status-success",
  degraded: "text-status-warning",
  failing: "text-status-error",
  unknown: "text-text-muted",
};

export default function AIInsightsPanel({
  workflowName,
  latencyMs,
  systemHealth,
  dependencies,
  recentChanges,
  aiSummary,
  aiComplexity,
  aiRisks = [],
  aiSummaryLoading,
  deploymentCheck,
  deploymentLoading,
  onRunDeploymentCheck,
  optimizations = [],
  optimizationsLoading,
  onRunOptimizationScan,
  documentation,
  documentationLoading,
  onGenerateDocumentation,
}: Props) {
  return (
    <div className="w-60 border-l border-border bg-surface-2 h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-border-light">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          AI Insights
        </h3>
      </div>

      <div className="p-4 space-y-5">

        {/* AI summary + complexity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-text-muted uppercase tracking-wide">AI Summary</p>
            {aiComplexity && !aiSummaryLoading && (
              <span className={`text-[10px] font-medium uppercase border rounded-full px-2 py-0.5 ${
                aiComplexity === "low"
                  ? "text-status-success border-status-success/30 bg-status-success/10"
                  : aiComplexity === "medium"
                  ? "text-status-warning border-status-warning/30 bg-status-warning/10"
                  : "text-status-error border-status-error/30 bg-status-error/10"
              }`}>
                {aiComplexity}
              </span>
            )}
          </div>
          {aiSummaryLoading ? (
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-surface-3 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-surface-3 rounded animate-pulse" />
            </div>
          ) : (
            <p className="text-xs text-text-muted leading-relaxed">
              {aiSummary || "No AI summary available yet."}
            </p>
          )}
        </div>

        {/* AI risks */}
        {!aiSummaryLoading && aiRisks.length > 0 && (
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2">AI-Flagged Risks</p>
            <div className="space-y-1.5">
              {aiRisks.map((risk, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="text-status-warning">⚠</span>
                  <span className="text-text-muted leading-relaxed">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Score / complexity / deployment readiness strip */}
        <AIScoreCard
          complexity={aiComplexity}
          deploymentScore={deploymentCheck?.score}
          deploymentStatus={deploymentCheck?.status}
          loading={aiSummaryLoading}
        />

        {/* Deployment readiness checklist */}
        <DeploymentReadiness
          score={deploymentCheck?.score}
          status={deploymentCheck?.status}
          blockingIssues={deploymentCheck?.blocking_issues}
          warnings={deploymentCheck?.warnings}
          loading={deploymentLoading}
          onRunCheck={onRunDeploymentCheck}
        />

        {/* Optimization opportunities */}
        <OptimizationPanel
          opportunities={optimizations}
          loading={optimizationsLoading}
          onRunOptimization={onRunOptimizationScan}
        />

        {/* Documentation */}
        <WorkflowDocumentation
          title={documentation?.title}
          overview={documentation?.overview}
          sections={documentation?.sections}
          nodeDocs={documentation?.node_docs}
          loading={documentationLoading}
          onGenerate={onGenerateDocumentation}
        />

        {/* System health */}
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2">System Health</p>
          <div className="flex items-center justify-between bg-surface rounded-lg border border-border px-3 py-2.5">
            <span className={`text-sm font-medium ${healthStyle[systemHealth]}`}>
              {systemHealth}
            </span>
            {latencyMs !== undefined && (
              <span className="text-xs text-text-muted">{latencyMs}ms avg</span>
            )}
          </div>
        </div>

        {/* Dependencies */}
        <WorkflowDependencies dependencies={dependencies} />

        {/* Recent changes */}
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wide mb-2">Recent Changes</p>
          <div className="space-y-2">
            {recentChanges.length === 0 && (
              <span className="text-xs text-text-muted">No recent changes</span>
            )}
            {recentChanges.map((c, i) => (
              <div key={i} className="text-xs">
                <p className="text-text-muted">{c.label}</p>
                <p className="text-text-muted text-[11px]">{c.time}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}