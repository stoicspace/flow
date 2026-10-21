import Eyebrow from "@/components/demo/Eyebrow";
import FadeUp from "@/components/demo/FadeUp";

export default function AboutHero() {
  return (
    <section className="px-4 pb-16 pt-36 sm:px-6 md:pt-40">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <FadeUp>
          <Eyebrow>About FlowLens</Eyebrow>
        </FadeUp>

        <FadeUp delay={0.08}>
          <h1 className="font-heading mt-7 text-4xl font-bold text-text-primary sm:text-5xl md:text-6xl lg:text-[68px] lg:leading-[80px]">
            Why we built <span className="text-accent-text">FlowLens</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.16}>
          <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-[21px] text-text-secondary sm:text-base sm:leading-[22px]">
            Why FlowLens exists, what we believe about owning your own AI and
            your own workflow data, and where things stand today.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
