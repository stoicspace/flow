import React from "react";

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function renderMatch(token: string, key: number): React.ReactNode {
  if (token.startsWith("**")) {
    return (
      <strong key={key} className="font-bold text-text-primary">
        {token.slice(2, -2)}
      </strong>
    );
  }
  if (token.startsWith("*")) {
    return (
      <em key={key} className="italic">
        {token.slice(1, -1)}
      </em>
    );
  }
  if (token.startsWith("`")) {
    return (
      <code
        key={key}
        className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-text-primary"
      >
        {token.slice(1, -1)}
      </code>
    );
  }
  const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
  if (m) {
    return (
      <a
        key={key}
        href={m[2]}
        className="text-accent-text underline underline-offset-2 hover:opacity-80"
      >
        {m[1]}
      </a>
    );
  }
  return token;
}

const IS_TOKEN =
  /^(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))$/;

export default function renderText(text: string): React.ReactNode[] {
  const parts = text.split(TOKEN).filter((p) => p !== "");
  return parts.map((p, i) => (
    <React.Fragment key={i}>
      {IS_TOKEN.test(p) ? renderMatch(p, i) : p}
    </React.Fragment>
  ));
}
