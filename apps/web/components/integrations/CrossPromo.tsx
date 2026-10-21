import Link from "next/link";

export default function CrossPromo() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-surface px-8 py-7 shadow-card sm:flex-row sm:items-center">
          <div>
            <h3 className="font-heading text-[20px] font-bold text-text-primary">
              Also works with Zapier and Make
            </h3>
            <p className="mt-1.5 text-[14px] text-text-muted">
              Same history, same plain-language diffs.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/docs/zapier"
              className="rounded-full border border-border px-5 py-2.5 text-[14px] font-semibold text-text-primary transition-colors hover:bg-surface-2"
            >
              Zapier →
            </Link>
            <Link
              href="/docs/make"
              className="rounded-full border border-border px-5 py-2.5 text-[14px] font-semibold text-text-primary transition-colors hover:bg-surface-2"
            >
              Make →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
