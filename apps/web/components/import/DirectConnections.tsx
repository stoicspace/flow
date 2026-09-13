// ─────────────────────────────────────────────────────────────
// src/components/import/DirectConnections.tsx
// ─────────────────────────────────────────────────────────────

"use client";

export default function DirectConnections() {
  return (
    <div className="bg-surface-2 border border-border rounded-xl p-5">
      <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase mb-4">
        Direct Connections
      </p>
      <div className="space-y-2">
        <a href="/connections"><button
            
            
            className="w-full flex items-center justify-between bg-surface border border-border-light rounded-lg px-4 py-3 hover:border-gray-500 transition-colors"
          >
            
              <span className="text-text-primary">
                Connect n8n / make / zaiper
              </span>
              
            
            <span className="text-text-muted">›</span>
          </button></a>
      </div>
    </div>
  );
}


