"use client";

import { useState } from "react";

interface Config {
  id: string;
  label: string;
  text: string;
}

export default function ProviderTabs({ configs }: { configs: Config[] }) {
  const [active, setActive] = useState(configs[0].id);
  const current = configs.find((c) => c.id === active) ?? configs[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {configs.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${
              c.id === active
                ? "bg-btn-primary-bg text-btn-primary-text"
                : "border border-border text-text-secondary hover:border-border-strong hover:text-text-primary"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-island-border bg-island">
        <div className="flex items-center justify-between border-b border-island-border px-5 py-2.5 font-mono text-[12px] text-island-dim">
          <span>[config file]</span>
          <span>your key</span>
        </div>
        <div className="min-h-[110px] px-5 py-5 font-mono text-[13.5px] leading-[22px] text-island-muted">
          {current.text}
        </div>
      </div>
    </div>
  );
}
