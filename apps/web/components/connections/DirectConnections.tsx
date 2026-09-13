"use client";
 
interface Connection {
  id: string;
  label: string;
  description: string;
  connected: boolean;
}
 
const connections: Connection[] = [
  { id: "n8n",    label: "n8n",    description: "Self-hosted workflow automation", connected: false },
  { id: "zapier", label: "Zapier", description: "Cloud automation platform",       connected: false },
  { id: "make",   label: "Make",   description: "Visual automation builder",       connected: false },
];
 
export default function DirectConnections() {
  return (
    <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border-light">
        <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase">
          Direct Connections
        </p>
      </div>
      <div className="divide-y divide-border-light">
        {connections.map(conn => (
          <div key={conn.id} className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-bold text-text-muted">
                {conn.label.slice(0, 1)}
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{conn.label}</p>
                <p className="text-[11px] text-text-muted">{conn.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {conn.connected ? (
                <span className="text-[11px] text-status-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                  Connected
                </span>
              ) : (
                <button className="text-xs text-brand-orange hover:underline">
                  Connect ›
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}