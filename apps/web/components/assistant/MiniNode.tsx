// ─────────────────────────────────────────────────────────────
// src/components/assistant/MiniNode.tsx
// Small node markers shown behind the chat (inbound/transform/destination)
// ─────────────────────────────────────────────────────────────

interface Props2 {
  label: string;
  sublabel: string;
  status: string;
  variant: "success" | "error" | "waiting";
  className?: string;
}

const variantStyle: Record<string, string> = {
  success: "border-brand-orange/50 text-brand-orange",
  error: "border-status-error/50 text-status-error",
  waiting: "border-border text-text-muted",
};

export function MiniNode({ label, sublabel, status, variant, className }: Props2) {
  return (
    <div className={`bg-surface-2 border rounded-xl px-5 py-4 w-48 ${variantStyle[variant]} ${className}`}>
      <p className="text-[10px] font-semibold tracking-wide uppercase mb-1.5 opacity-80">
        {label}
      </p>
      <p className="text-base font-semibold text-text-primary mb-1">{sublabel}</p>
      <p className="text-[11px] font-mono opacity-70">{status}</p>
    </div>
  );
}


