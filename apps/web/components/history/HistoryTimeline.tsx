import { GitBranch, RotateCcw, Upload, Zap } from "lucide-react";
 
interface HistoryEntry {
  id: string;
  action: string;
  actor: string;
  actorType: "user" | "system" | "ai";
  workflowName: string;
  workflowId: string;
  time: string;
  date: string;
}
 
function actionIcon(action: string) {
  if (action.includes("restore")) return <RotateCcw size={13} />;
  if (action.includes("import")) return <Upload size={13} />;
  if (action.includes("snapshot")) return <GitBranch size={13} />;
  return <Zap size={13} />;
}
 
function actionLabel(action: string) {
  return action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
 
const actorBadge = {
  user:   "bg-brand-orange/15 text-brand-orange",
  system: "bg-gray-500/15 text-text-muted",
  ai:     "bg-text-primary/15 text-brand-orange",
};
 
export default function HistoryTimeline({ entries }: { entries: HistoryEntry[] }) {
  // Group by date
  const grouped = entries.reduce<Record<string, HistoryEntry[]>>((acc, e) => {
    (acc[e.date] = acc[e.date] || []).push(e);
    return acc;
  }, {});
 
  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3 px-1">
            {date}
          </p>
          <div className="space-y-2">
            {items.map(entry => (
              <div
                key={entry.id}
                className="flex items-center gap-4 bg-surface-2 border border-border rounded-lg px-4 py-3 hover:border-brand-blue/30 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted flex-shrink-0">
                  {actionIcon(entry.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">{actionLabel(entry.action)}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${actorBadge[entry.actorType]}`}>
                      {entry.actorType === "ai" ? "FlowLens AI" : entry.actor}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{entry.workflowName}</p>
                </div>
                <span className="text-[11px] text-text-muted whitespace-nowrap flex-shrink-0">
                  {entry.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}