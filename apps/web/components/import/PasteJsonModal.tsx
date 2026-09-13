// ─────────────────────────────────────────────────────────────
// src/components/import/PasteJsonModal.tsx
// ─────────────────────────────────────────────────────────────

"use client";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (raw: string) => void;
}

export default function PasteJsonModal({ open, onClose, onSubmit }: Props) {
  const [value, setValue] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-surface/60 flex items-center justify-center z-50 p-6">
      <div className="bg-surface-2 border border-border rounded-xl p-6 w-full max-w-2xl">
        <h3 className="text-base font-semibold text-text-primary mb-3">Paste raw JSON</h3>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Paste your workflow JSON here..."
          rows={12}
          className="w-full bg-surface border border-border-light rounded-lg px-3 py-2.5 text-xs font-mono text-text-muted placeholder:text-text-muted outline-none focus:border-brand-orange/50 resize-none"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="text-sm text-text-muted hover:text-text-primary px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSubmit(value); setValue(""); }}
            disabled={!value.trim()}
            className="bg-brand-orange text-text-primary text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}


