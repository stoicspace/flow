
// ─────────────────────────────────────────────────────────────
// src/components/diff/RecoveryControls.tsx
// ─────────────────────────────────────────────────────────────

"use client";

interface Props {
  onRestore: () => void;
  restoring?: boolean;
  restoredMessage?: string;
}

export default function RecoveryControls({ onRestore, restoring, restoredMessage }: Props) {
  if (restoredMessage) {
    return (
      <div className="bg-status-success/10 border border-status-success/20 rounded-lg px-4 py-3">
        <p className="text-sm text-status-success">{restoredMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={onRestore}
        disabled={restoring}
        className="flex-1 text-sm font-medium bg-status-error/10 border border-status-error/20 text-status-error rounded-lg py-2.5 hover:bg-status-error/20 transition-colors disabled:opacity-60"
      >
        {restoring ? "Restoring..." : "Restore to last working version"}
      </button>
    </div>
  );
}


