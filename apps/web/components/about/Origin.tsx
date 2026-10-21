import FadeUp from "@/components/demo/FadeUp";

export default function Origin() {
  return (
    <section id="origin" className="px-4 pb-20 sm:px-6 md:pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
          <FadeUp>
            <div>
              <p className="text-[13px] font-semibold text-accent-text">
                01 · The origin
              </p>
              <h2 className="font-heading mt-5 text-3xl font-bold leading-[1.15] text-text-primary sm:text-4xl">
                One afternoon that should have been a good day.
              </h2>
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <div className="space-y-5 text-[16px] leading-[25px] text-text-secondary">
              <p>
                It started on a day that was going fine. Then a workflow that
                had been running without a problem just stopped working.
              </p>
              <p>
                I didn&apos;t know why. I opened it, stared at the nodes, and
                had no idea what had changed or where to even start looking. So
                I did what most people do: searched forums, searched Google,
                asked an AI for help, tried things, backed them out, tried other
                things. A few hours later, it was fixed. I never did find a
                clean answer for why it had broken in the first place, just
                enough of a trail to patch it and move on.
              </p>
              <p>
                That one afternoon turned a good day into a workday I
                hadn&apos;t planned on. And the thing that stuck with me
                wasn&apos;t the bug itself: it was how much of that time went
                into just figuring out{" "}
                <em className="italic text-text-primary">what changed</em>,
                before I could even start fixing anything.
              </p>

              <div className="relative overflow-hidden rounded-2xl border border-island-border bg-island px-7 py-7 sm:px-9 sm:py-8">
                <div
                  aria-hidden="true"
                  className="glow-strong pointer-events-none absolute -right-16 top-1/2 h-64 w-64 -translate-y-1/2 opacity-50"
                />
                <p className="relative text-[17px] font-medium leading-[26px] text-island-text sm:text-[19px] sm:leading-[28px]">
                  I built FlowLens so that part doesn&apos;t have to happen to
                  someone else{" "}
                  <em className="italic text-island-accent">
                    the same way it happened to me.
                  </em>
                </p>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
