interface NotificationItemProps {
  type: "error" | "warning" | "success" | "info";
  title: string;
  description: string;
  time: string;
  unread?: boolean;
}
 
const typeStyle = {
  error:   { dot: "bg-status-error",   bg: "border-status-error/20" },
  warning: { dot: "bg-status-warning", bg: "border-status-warning/20" },
  success: { dot: "bg-status-success", bg: "border-status-success/20" },
  info:    { dot: "bg-brand-blue",     bg: "border-brand-blue/20" },
};
 
export function NotificationItem({ type, title, description, time, unread }: NotificationItemProps) {
  const s = typeStyle[type];
  return (
    <div className={`flex gap-3 px-4 py-3.5 border-b border-border-light hover:bg-surface-2/50 transition-colors ${unread ? "bg-surface-2/30" : ""}`}>
      <div className="mt-1.5 flex-shrink-0">
        <span className={`w-2 h-2 rounded-full block ${s.dot}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${unread ? "text-text-primary" : "text-text-muted"}`}>{title}</p>
          <span className="text-[11px] text-text-muted whitespace-nowrap flex-shrink-0">{time}</span>
        </div>
        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
      </div>
      {unread && <div className="w-1.5 h-1.5 rounded-full bg-brand-brand-orangemt-2 flex-shrink-0" />}
    </div>
  );
}
 