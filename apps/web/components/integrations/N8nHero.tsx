import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Logo from "@/components/demo/Logo";
import Eyebrow from "@/components/demo/Eyebrow";

export default function N8nHero() {
  return (
    <section className="px-6 pt-44 text-center">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center">
        <div className="flex items-center gap-[70px]">
          <div className="grid h-[100px] w-[100px] place-items-center rounded-[26px] bg-white shadow-card">
            <span className="font-heading text-[28px] font-extrabold tracking-tight text-[#0e0e10]">
              n8n
            </span>
          </div>
          <div className="relative grid h-[100px] w-[100px] place-items-center rounded-[26px] border border-accent/30 bg-island shadow-[0_10px_50px_8px_rgba(200,104,74,0.32)]">
            <Logo size={64} />
          </div>
        </div>

        <div className="mt-5">
          <Eyebrow>Integration · Cloud or self-hosted</Eyebrow>
        </div>

        <h1 className="font-heading mt-8 text-[40px] font-bold leading-[1.08] tracking-tight text-text-primary sm:text-[54px] lg:text-[74px]">
          <span className="block">Know what changed in your</span>
          <span className="block text-accent-text">n8n workflows.</span>
        </h1>

        <p className="mt-6 max-w-[600px] text-[16px] leading-[25px] text-text-muted">
          FlowLens keeps a version history of your n8n workflows, diffs them
          automatically, and explains what changed and why it matters. It
          doesn&apos;t care whether your n8n instance is cloud or self-hosted,
          it connects the same way either way.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="shadow-btn inline-flex items-center gap-2 rounded-full bg-btn-primary-bg px-6 py-3 text-[15px] font-semibold text-btn-primary-text transition-opacity hover:opacity-90"
          >
            Connect n8n free
            <ArrowUpRight size={15} />
          </Link>
          <Link
            href="/docs/n8n"
            className="inline-flex items-center rounded-full border border-border px-6 py-3 text-[15px] font-semibold text-text-primary transition-colors hover:bg-surface-2"
          >
            Read the setup docs
          </Link>
        </div>
      </div>
    </section>
  );
}
