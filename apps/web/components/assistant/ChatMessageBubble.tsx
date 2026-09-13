// ─────────────────────────────────────────────────────────────
// src/components/assistant/ChatMessageBubble.tsx
// ─────────────────────────────────────────────────────────────

import { Fragment } from "react";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  streaming?: boolean;
}

// Small dependency-free markdown-lite renderer — Copilot answers now cover
// reviews, docs, and optimization lists, so plain text alone reads poorly.
// Supports: **bold**, `inline code`, fenced ```code blocks```, - / * bullet
// lists, 1. numbered lists, and paragraph breaks. Anything unsupported just
// renders as plain text — never throws.
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${keyPrefix}-${i}`} className="bg-surface-3 rounded px-1 py-0.5 text-[11px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>;
  });
}

function renderMarkdown(content: string) {
  const blocks = content.split(/```/g);

  return blocks.map((block, blockIndex) => {
    // Odd-indexed blocks are inside a fenced code block
    if (blockIndex % 2 === 1) {
      return (
        <pre
          key={`code-${blockIndex}`}
          className="bg-surface-3 rounded-lg px-3 py-2 my-2 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap"
        >
          {block.trim()}
        </pre>
      );
    }

    const lines = block.split("\n").filter(l => l.trim().length > 0);
    if (lines.length === 0) return null;

    const isBulletList = lines.every(l => /^\s*[-*]\s+/.test(l));
    const isNumberedList = lines.every(l => /^\s*\d+\.\s+/.test(l));

    if (isBulletList) {
      return (
        <ul key={`ul-${blockIndex}`} className="list-disc list-inside space-y-1 my-1.5">
          {lines.map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^\s*[-*]\s+/, ""), `ul-${blockIndex}-${i}`)}</li>
          ))}
        </ul>
      );
    }

    if (isNumberedList) {
      return (
        <ol key={`ol-${blockIndex}`} className="list-decimal list-inside space-y-1 my-1.5">
          {lines.map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^\s*\d+\.\s+/, ""), `ol-${blockIndex}-${i}`)}</li>
          ))}
        </ol>
      );
    }

    return (
      <p key={`p-${blockIndex}`} className="whitespace-pre-wrap">
        {renderInline(block.trim(), `p-${blockIndex}`)}
      </p>
    );
  });
}

export default function ChatMessageBubble({ role, content, timestamp, streaming }: MessageProps) {
  if (role === "user") {
    return (
      <div className="flex flex-col items-end">
        <div className="bg-surface-3 text-text-primary text-sm rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[85%]">
          {content}
        </div>
        {timestamp && <span className="text-[11px] text-text-muted mt-1">{timestamp}</span>}
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <span className="w-7 h-7 rounded-lg bg-brand-orange/15 border border-brand-orange/25 flex items-center justify-center flex-shrink-0 text-brand-orange text-xs mt-0.5">
        ✦
      </span>
      <div className="text-sm text-gray-200 leading-relaxed max-w-[90%] space-y-1">
        {renderMarkdown(content)}
        {streaming && <span className="inline-block w-1.5 h-3.5 bg-gray-400 ml-0.5 animate-pulse" />}
      </div>
    </div>
  );
}
