import { KeyRound, Search } from "lucide-react";
import FadeUp from "@/components/demo/FadeUp";

const beliefs = [
  {
    icon: Search,
    title: "The problem that shows up months later",
    body: (
      <>
        We think the &quot;AI workflow copilot&quot; category has mostly been
        built around <em>generating</em> workflows faster: describing what you
        want in plain English and getting a workflow back. That&apos;s useful,
        but it&apos;s a different problem from the one that shows up months
        later: a working workflow that quietly stops working, with no record of
        what changed.
      </>
    ),
  },
  {
    icon: KeyRound,
    title: "Your data, your AI provider",
    body: (
      <>
        We also think workflow data shouldn&apos;t have to pass through someone
        else&apos;s AI service by default. A lot of what a workflow JSON file
        reveals (which systems talk to which, what triggers a payment, how a
        lead gets routed) is close to the shape of how a business actually
        runs. That&apos;s why FlowLens supports{" "}
        <span className="underline underline-offset-2 text-island-accent">
          bringing your own AI provider key
        </span>{" "}
        instead of requiring one shared service everyone&apos;s data funnels
        through.
      </>
    ),
  },
];

export default function Believe() {
  return (
    <section
      id="believe"
      className="relative overflow-hidden bg-island px-4 py-20 sm:px-6 md:py-28"
    >
      <div
        aria-hidden="true"
        className="glow-soft pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[720px] -translate-x-1/2 opacity-40"
      />
      <div className="relative mx-auto max-w-6xl">
        <FadeUp>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-island-accent">
              02 · What we believe
            </p>
            <h2 className="font-heading mt-4 text-3xl font-bold text-island-text sm:text-4xl md:text-5xl">
              What we believe
            </h2>
          </div>
        </FadeUp>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {beliefs.map((b, i) => (
            <FadeUp key={b.title} delay={0.08 * i}>
              <div className="h-full rounded-2xl border border-island-border bg-island-soft p-7 sm:p-8">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
                  <b.icon size={18} className="text-accent-soft" />
                </span>
                <h3 className="font-heading mt-5 text-[19px] font-bold text-island-text">
                  {b.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[24px] text-island-muted">
                  {b.body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
