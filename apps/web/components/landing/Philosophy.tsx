import Eyebrow from "./Eyebrow";

export default function Philosophy() {
  return (
    <section className="py-24 sm:py-32 md:py-40" id="philosophy">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <Eyebrow>Our Philosophy</Eyebrow>

        <h2 className="mt-10 sm:mt-12 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
          Automation should
          <br />
          <span className="text-brand-orange">save time.</span>
        </h2>

        <h2 className="mt-6 sm:mt-8 md:mt-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text-muted">
          Debugging shouldn&apos;t.
        </h2>

        <p className="mt-10 sm:mt-12 md:mt-16 text-base sm:text-lg md:text-2xl text-text-muted leading-7 sm:leading-8 md:leading-10 max-w-3xl mx-auto">
          We&apos;re building the AI mechanic for workflows.
          <br />
          <br />
          When something breaks,
          <span className="text-text-primary   font-semibold">
            {" "}
            FlowLens tells you exactly why.
          </span>
        </p>
      </div>
    </section>
  );
}
