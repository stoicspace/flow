interface Workflow {
  id: string;
  status: "healthy" | "degraded" | "failing" | "unknown";
}

interface SystemHealthCardProps {
  workflows: Workflow[];
  loading?: boolean;
}

export default function SystemHealthCard({
  workflows,
  loading = false,
}: SystemHealthCardProps) {
  if (loading) {
    return (
      <div className="m-5 rounded-lg border border-border bg-surface-2 p-6">
        <p className="text-text-muted text-sm">
          Calculating system health...
        </p>
      </div>
    );
  }

  const total = workflows.length;

  const healthy = workflows.filter(
    wf => wf.status === "healthy"
  ).length;

  const degraded = workflows.filter(
    wf => wf.status === "degraded"
  ).length;

  const failing = workflows.filter(
    wf => wf.status === "failing"
  ).length;

  const unknown = workflows.filter(
    wf => wf.status === "unknown"
  ).length;

  const healthPercentage =
    total > 0
      ? Math.round((healthy / total) * 100)
      : 0;

  return (
    <div className="m-5 flex flex-col rounded-lg border border-border bg-surface-2 p-6 shadow-xs transition-colors hover:bg-surface-3">

      <h2 className="mb-1 text-xl font-semibold text-text-primary">
        SYSTEM HEALTH
      </h2>

      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-brand-orange">
          {healthPercentage}%
        </span>

        <span className="pl-2 text-text-muted">
          workflows healthy
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-brand-orange transition-all"
          style={{ width: `${healthPercentage}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-status-success">
            {healthy}
          </span>{" "}
          <span className="text-text-muted">
            Healthy
          </span>
        </div>

        <div>
          <span className="text-status-warning">
            {degraded}
          </span>{" "}
          <span className="text-text-muted">
            Degraded
          </span>
        </div>

        <div>
          <span className="text-status-error">
            {failing}
          </span>{" "}
          <span className="text-text-muted">
            Failing
          </span>
        </div>

        <div>
          <span className="text-text-muted">
            {unknown}
          </span>{" "}
          <span className="text-text-muted">
            Unknown
          </span>
        </div>
      </div>

    </div>
  );
}