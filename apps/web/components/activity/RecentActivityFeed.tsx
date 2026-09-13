interface ActivityEvent {
  id: string;
  icon: "snapshot" | "incident" | "restore" | "ai" | "import";
  title: string;
  subtitle: string;
  time: string;
  // Optional AI note attached to the event (e.g. a short review/summary
  // snippet) so this feed can read as "what the AI found" not just a log.
  aiNote?: string;
}
 
const activityIcon: Record<string, string> = {
  snapshot: "📸",
  incident: "🔴",
  restore:  "↺",
  ai:       "✦",
  import:   "⬆",
};
 
const activityDot: Record<string, string> = {
  snapshot: "bg-brand-blue",
  incident: "bg-status-error",
  restore:  "bg-status-success",
  ai:       "bg-brand-orange",
  import:   "bg-status-warning",
};
 
export default function RecentActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border-light">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border-light">
        {events.map(e => (
          <div key={e.id} className="flex items-start gap-3 px-4 py-3">
            <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${activityDot[e.icon]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{e.title}</p>
              <p className="text-[11px] text-text-muted mt-0.5 truncate">{e.subtitle}</p>
              {e.aiNote && (
                <p className="text-[11px] text-brand-orange/90 mt-0.5 truncate">✦ {e.aiNote}</p>
              )}
            </div>
            <span className="text-[11px] text-text-muted whitespace-nowrap flex-shrink-0">{e.time}</span>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-xs text-text-muted px-4 py-6 text-center">No recent activity</p>
        )}
      </div>
    </div>
  );
}