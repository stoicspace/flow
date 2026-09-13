"use client";

import { ReactNode, useState } from "react";

interface HoverTooltipProps {
  children: ReactNode;
  content: ReactNode;
}

export default function HoverTooltip({ children, content }: HoverTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div className="absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 whitespace-nowrap">
          {/* Arrow pointing up */}
          <div className="absolute left-1/2 -top-1 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-border bg-surface-2" />

          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-text-primary shadow-xl">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}