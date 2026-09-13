// ============================================================
// IMPORT WORKFLOW PAGE
// Copy each block to its file path
// ============================================================

// ─────────────────────────────────────────────────────────────
// src/components/import/Dropzone.tsx
// ─────────────────────────────────────────────────────────────

"use client";
import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
  onPasteRaw: () => void;
  status: "idle" | "processing" | "done" | "error";
  statusMessage?: string;
}

export default function Dropzone({ onFile, onPasteRaw, status, statusMessage }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer border-2 border-dashed rounded-2xl px-10 py-20 flex flex-col items-center text-center transition-colors ${
        dragging
          ? "border-brand-orange bg-brand-orange/5"
          : "border-border hover:border-gray-600"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}
      />

      <div className="w-16 h-16 rounded-full bg-surface-2 border border-border flex items-center justify-center mb-6">
        <UploadCloud size={28} className="text-brand-orange" />
      </div>

      <h2 className="text-2xl font-semibold text-text-primary mb-2">
        {status === "processing"
          ? "Processing..."
          : status === "done"
          ? "Imported successfully"
          : status === "error"
          ? "Something went wrong"
          : "Drop your JSON here"}
      </h2>

      <p className="text-sm text-text-muted mb-8">
        {statusMessage || "Drag and drop your workflow files or click to browse local storage"}
      </p>

      <div className="flex gap-3" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
        >
          <UploadCloud size={15} />
          Browse Files
        </button>
        <button
          onClick={onPasteRaw}
          className="bg-surface-2 border border-border hover:border-gray-500 text-text-primary font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
        >
          Paste Raw JSON
        </button>
      </div>
    </div>
  );
}

