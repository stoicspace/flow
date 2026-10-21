import Link from "next/link";
import { hrefFor, type Article } from "@/lib/docs/articles";

export default function Pager({ prev }: { prev?: Article }) {
  return (
    <div className="mt-14 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={hrefFor(prev.slug)}
          className="rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-border-strong"
        >
          <span className="block text-[12px] text-text-muted">Previous</span>
          <span className="mt-1 flex items-center gap-2 text-[15px] font-bold text-text-primary">
            <span aria-hidden="true">←</span> {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      <Link
        href="/contact"
        className="rounded-xl border border-border bg-surface px-5 py-4 text-right transition-colors hover:border-border-strong"
      >
        <span className="block text-[12px] text-text-muted">
          Not sure it fits your setup?
        </span>
        <span className="mt-1 flex items-center justify-end gap-2 text-[15px] font-bold text-text-primary">
          Ask us <span aria-hidden="true">→</span>
        </span>
      </Link>
    </div>
  );
}
