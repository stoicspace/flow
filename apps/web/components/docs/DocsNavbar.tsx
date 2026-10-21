"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import Logo from "@/components/demo/Logo";
import ThemeToggle from "@/components/ui/theme-toggle/page";
import { searchIndex, type SearchDoc } from "@/lib/docs/articles";

function score(doc: SearchDoc, q: string): { s: number; snippet: string } {
  const t = doc.title.toLowerCase();
  const h = doc.headings.join("\n").toLowerCase();
  const b = doc.text.toLowerCase();
  if (t.includes(q)) return { s: 3, snippet: doc.headings.find((x) => x.toLowerCase().includes(q)) ?? doc.headings[0] };
  if (h.includes(q)) {
    const head = doc.headings.find((x) => x.toLowerCase().includes(q))!;
    return { s: 2, snippet: head };
  }
  if (b.includes(q)) {
    const idx = b.indexOf(q);
    const start = Math.max(0, idx - 36);
    const raw = doc.text.slice(start, start + 110);
    return { s: 1, snippet: `${start > 0 ? "…" : ""}${raw}${start + 110 < doc.text.length ? "…" : ""}` };
  }
  return { s: 0, snippet: "" };
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-accent-text">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  );
}

function Palette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const base = searchIndex.map((d) => ({ doc: d, ...score(d, query) }));
    const list = query ? base.filter((r) => r.s > 0) : base.map((r) => ({ ...r, s: 1 }));
    return list.sort((a, b) => b.s - a.s).slice(0, 8);
  }, [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setActive(0), [q]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active].doc.href);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto mt-[14vh] w-full max-w-[560px] px-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-float">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search size={16} className="shrink-0 text-text-muted" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKey}
              placeholder="Search docs..."
              className="w-full bg-transparent text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-text-muted">
              esc
            </kbd>
          </div>

          <div className="max-h-[380px] overflow-y-auto py-1.5">
            {results.length === 0 && (
              <p className="px-4 py-8 text-center text-[14px] text-text-muted">
                No results for &ldquo;{q}&rdquo;.
              </p>
            )}
            {results.map((r, i) => (
              <button
                key={r.doc.slug}
                onClick={() => go(r.doc.href)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === active ? "bg-surface-2" : ""
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-text-primary">
                    <Highlight text={r.doc.title} q={q.trim()} />
                  </span>
                  <span className="block truncate text-[12px] text-text-muted">
                    <Highlight text={r.snippet} q={q.trim()} />
                  </span>
                </span>
                <span className="shrink-0 text-[11px] uppercase tracking-wide text-text-muted">
                  {r.doc.group === "GET STARTED"
                    ? "Start"
                    : r.doc.group === "YOUR DATA & AI"
                      ? "Data & AI"
                      : "Integrations"}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-text-muted">
            <span>↑↓ to navigate · ↵ to open</span>
            <span className="font-mono">⌘K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocsNavbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <nav className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 rounded-2xl border border-border/70 bg-surface/70 px-4 py-2.5 backdrop-blur-xl sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="font-heading text-[20px] font-bold tracking-tight text-text-primary">
            FlowLens
          </span>
          <span className="rounded-full bg-chip px-2.5 py-0.5 text-[12px] font-semibold text-accent-text">
            Docs
          </span>
        </Link>

        <button
          onClick={() => setOpen(true)}
          className="mx-auto hidden w-full max-w-[380px] items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 text-left text-[13px] text-text-muted transition-colors hover:border-border-strong md:flex"
        >
          <Search size={14} />
          <span>Search docs...</span>
          <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 font-mono text-[11px]">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="hidden text-[15px] text-text-secondary transition-colors hover:text-text-primary sm:block"
          >
            Product
          </Link>
          <Link
            href="/login"
            className="hidden text-[15px] text-text-secondary transition-colors hover:text-text-primary sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-btn-primary-bg px-5 py-2 text-[15px] font-semibold text-btn-primary-text transition-opacity hover:opacity-90"
          >
            Start free
            <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      <Palette open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
