import FadeUp from "@/components/demo/FadeUp";

export default function Status() {
  return (
    <section id="status" className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
          <FadeUp>
            <div>
              <p className="text-[13px] font-semibold text-accent-text">
                03 · Where things stand
              </p>
              <h2 className="font-heading mt-5 text-3xl font-bold leading-[1.15] text-text-primary sm:text-4xl">
                Where things stand today
              </h2>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-border-warm bg-chip px-4 py-1.5 text-[13px] font-medium text-accent-text">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Just starting
              </span>
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <p className="text-[18px] leading-[30px] text-text-secondary sm:text-[21px] sm:leading-[34px]">
              We&apos;re just starting. FlowLens doesn&apos;t have a long
              customer list or years of track record yet: it exists because one
              specific bad afternoon convinced one person this problem was worth
              solving properly, and it&apos;s being built for{" "}
              <em className="italic text-accent-text">
                anyone who&apos;s had that same afternoon.
              </em>
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
