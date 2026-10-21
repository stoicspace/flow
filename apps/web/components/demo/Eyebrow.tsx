interface EyebrowProps {
  children: React.ReactNode;
}

export default function Eyebrow({ children }: EyebrowProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-1.5 text-xs font-medium tracking-wide text-text-secondary">
      {children}
    </span>
  );
}
