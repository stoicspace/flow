import Eyebrow from "@/components/demo/Eyebrow";

const cards = [
  {
    glyph: "–",
    label: "parameter",
    title: "A node parameter changed",
    body: "And what that change does to the run.",
    featured: false,
  },
  {
    glyph: "↻",
    label: "connection",
    title: "A connection got rewired",
    body: "Branches that now skip a step.",
    featured: false,
  },
  {
    glyph: "!",
    label: "credential",
    title: "A credential reference broke",
    body: "No longer referenced correctly.",
    featured: false,
  },
  {
    glyph: "–",
    label: "retry",
    title: "Error handling went missing",
    body: "A removed retry, before a customer finds it.",
    featured: true,
  },
];

export default function Notices() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Eyebrow>What it catches</Eyebrow>
          <h2 className="font-heading text-[34px] font-bold tracking-tight text-text-primary sm:text-[44px] lg:text-[48px]">
            What it notices in an n8n workflow
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl border p-6 ${
                card.featured
                  ? "border-accent/50 bg-island dark:bg-chip"
                  : "border-border bg-surface-2"
              }`}
            >
              <p
                className={`text-[14px] font-medium ${
                  card.featured
                    ? "text-accent-soft"
                    : "text-accent dark:text-accent-text"
                }`}
              >
                <span aria-hidden="true">{card.glyph}</span> {card.label}
              </p>
              <p
                className={`mt-3 text-[16px] font-bold leading-[22px] ${
                  card.featured ? "text-island-text" : "text-text-primary"
                }`}
              >
                {card.title}
              </p>
              <p
                className={`mt-2 text-[14.5px] leading-[20px] ${
                  card.featured ? "text-island-muted" : "text-text-muted"
                }`}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-[14px] text-text-muted">
          FlowLens sits alongside your existing error workflows and execution
          logs; it doesn&apos;t replace them.
        </p>
      </div>
    </section>
  );
}
