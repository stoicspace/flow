import { Check } from "lucide-react";
import Eyebrow from "@/components/demo/Eyebrow";
import FadeUp from "@/components/demo/FadeUp";

const plans = ["Free", "Pro", "Team", "Self-hosted"];

type Cell = string | "check" | "dash";

const rows: { feature: string; values: Cell[] }[] = [
  { feature: "Workflows", values: ["1", "10", "20", "Unlimited"] },
  {
    feature: "Version history",
    values: ["10 days", "30 days", "50 days", "Full"],
  },
  {
    feature: "Plain-language diffs",
    values: ["check", "check", "check", "check"],
  },
  { feature: "Proposed fixes", values: ["check", "check", "check", "check"] },
  {
    feature: "Bring your own AI key",
    values: ["dash", "dash", "dash", "check"],
  },
  {
    feature: "Paste JSON import",
    values: ["check", "check", "check", "check"],
  },
  {
    feature: "Direct connect + auto sync",
    values: ["dash", "dash", "check", "check"],
  },
  { feature: "Seats", values: ["1", "1", "3", "Unlimited"] },
];

function CellValue({ cell, featured }: { cell: Cell; featured: boolean }) {
  if (cell === "check")
    return (
      <Check
        size={16}
        className={`mx-auto ${featured ? "text-accent-soft" : "text-text-secondary"}`}
      />
    );
  if (cell === "dash")
    return (
      <span className="text-text-muted" aria-label="not included">
        –
      </span>
    );
  return (
    <span
      className={`text-[14px] ${featured ? "text-accent-text" : "text-text-secondary"}`}
    >
      {cell}
    </span>
  );
}

export default function ComparePlans() {
  return (
    <section id="compare" className="px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto max-w-[1100px]">
        <FadeUp>
          <div className="text-center">
            <Eyebrow>Compare</Eyebrow>
            <h2 className="font-heading mt-6 text-3xl font-bold text-text-primary sm:text-4xl md:text-5xl">
              Compare plans
            </h2>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-border shadow-card">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="bg-surface-2">
                  <th className="px-5 py-4 text-[14px] font-bold text-text-primary">
                    Feature
                  </th>
                  {plans.map((p, i) => (
                    <th
                      key={p}
                      className={`px-5 py-4 text-center text-[14px] font-bold `}
                    >
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-t border-border bg-surface"
                  >
                    <td className="px-5 py-4 text-[14px] font-medium text-text-primary">
                      {row.feature}
                    </td>
                    {row.values.map((cell, i) => (
                      <td
                        key={i}
                        className={`px-5 py-4 text-center ${
                          i === 1 ? "bg-surface-4" : ""
                        }`}
                      >
                        <CellValue cell={cell} featured={i === 1} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
