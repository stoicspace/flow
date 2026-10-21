const chips = [
  { tag: "retry", text: "Retry removed on payment webhook" },
  { tag: "rename", text: "Field email renamed to contact_email" },
  {
    tag: "credential",
    text: "Slack node no longer references its credential",
  },
  { tag: "rewire", text: "IF branch rewired to skip Fulfill order" },
];

export default function ChangeChips() {
  const doubled = [...chips, ...chips];

  return (
    <section
      className="overflow-hidden border-y border-border bg-surface-2/50 py-5"
      aria-label="Example detected changes"
    >
      <div className="fl-marquee-track flex w-max gap-4">
        {doubled.map((chip, i) => (
          <div
            key={`${chip.tag}-${i}`}
            className="flex items-center gap-3 rounded-full border border-border bg-surface px-5 py-3 shadow-card"
          >
            <span className="text-[13px] font-semibold text-accent-text">
              {chip.tag}
            </span>
            <span className="whitespace-nowrap text-[14px] text-text-secondary">
              {chip.text}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
