// ============================================================
// VISUAL COMPARE PAGE,the hero "Diff" feature
// Copy each block to its file path
// ============================================================

// ─────────────────────────────────────────────────────────────
// src/components/diff/DiffLegend.tsx
// ─────────────────────────────────────────────────────────────

export default function DiffLegend() {
  const items = [
    { color: "#22c55e", label: "Added" },
    { color: "#f59e0b", label: "Modified" },
    { color: "#ef4444", label: "Removed" },
  ];

  return (
    <div className="flex items-center gap-4">
      {items.map(item => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs text-text-muted">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}


