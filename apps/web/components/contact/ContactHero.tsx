import Link from "next/link";
import { Mail, BookOpen } from "lucide-react";

export default function ContactHero() {
  return (
    <div>
      <span className="inline-flex items-center rounded-full border border-border bg-surface-2 px-4 py-1.5 text-[13px] font-medium text-text-secondary">
        Contact
      </span>

      <h1 className="font-heading mt-7 text-[42px] font-bold leading-[1.07] tracking-tight text-text-primary sm:text-[54px] lg:text-[67px]">
        <span className="block">Ask us, rather than</span>
        <span className="block text-accent-text">guessing from the docs.</span>
      </h1>

      <p className="mt-5 max-w-[540px] text-[16.5px] leading-[26px] text-text-secondary">
        Questions about how FlowLens handles your workflow data, which AI
        providers it supports, or whether it fits your setup. Send them over.
      </p>

      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-chip text-accent-text">
            <Mail size={17} />
          </span>
          <span>
            <a href="mailto:spacestoic7@gmail.com" className="text-[15px] font-bold text-text-primary underline">
              <span className="sr-only">Email </span>
            </a>
          </span>
        </div>

        <Link
          href="/docs/self-hosting"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-border-strong"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-chip text-accent-text">
            <BookOpen size={17} />
          </span>
          <span>
            <span className="block text-[12.5px] text-text-muted">
              Prefer reading first?
            </span>
            <span className="mt-0.5 block text-[15px] font-bold text-text-primary">
              Self-hosting &amp; BYOK docs →
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
