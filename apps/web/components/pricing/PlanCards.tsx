import { Check } from "lucide-react";
import Link from "next/link";
import FadeUp from "@/components/demo/FadeUp";

interface Plan {
  name: string;
  tagline: string;
  price: React.ReactNode;
  cta: { label: string; href: string; variant: "outline" | "primary" | "coral" };
  features: string[];
  featured?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    name: "Free",
    tagline: "For your first broken workflow.",
    price: (
      <span className="font-heading text-[40px] font-bold leading-none text-text-primary">
        $0{" "}
        <span className="text-[14px] font-medium text-text-muted">forever</span>
      </span>
    ),
    cta: { label: "Start free", href: "/signup", variant: "outline" },
    features: [
      "1 workflow",
      "Version history · 10 days",
      "Plain-language diffs",
      "Proposed fixes",
      "Paste JSON import",
    ],
  },
  {
    name: "Pro",
    tagline: "For anyone running workflows that matter.",
    price: (
      <span className="font-heading text-[40px] font-bold leading-none text-island-text">
        $30
        <span className="text-[14px] font-medium text-island-dim">
          per month
        </span>
      </span>
    ),
    cta: {
      label: "Start free trial",
      href: "/signup",
      variant: "coral",
    },
    features: [
      "Everything in Free",
      "10 workflows",
      "30 days history",
    ],
    featured: true,
    badge: "Most popular",
  },
  {
    name: "Team",
    tagline: "For teams sharing automations.",
    price: (
      <span className="font-heading text-[40px] font-bold leading-none text-text-primary">
        $100
        <span className="text-[14px] font-medium text-text-muted">
          per month
        </span>
      </span>
    ),
    cta: { label: "Start free trial", href: "/signup", variant: "primary" },
    features: [
      "Everything in Pro",
      "3 seats",
      "20 workflows",
      "Workflow-based access control",
      "Unlimited history diffs",
    ],
  },
  {
    name: "Self-hosted",
    tagline: "Nothing leaves your infrastructure.",
    price: (
      <span className="font-heading text-[32px] font-bold leading-none text-text-primary">
        Let&apos;s talk
      </span>
    ),
    cta: { label: "Contact us", href: "/contact", variant: "outline" },
    features: [
      "Runs on your infrastructure",
      "Point at a self-hosted model",
      "Works with self-hosted n8n",
      "Direct connect + auto sync",
    ],
  },
];

const ctaClasses: Record<Plan["cta"]["variant"], string> = {
  outline:
    "border border-border-strong bg-surface text-text-primary hover:border-accent/50",
  primary:
    "bg-btn-primary-bg text-btn-primary-text hover:opacity-90 shadow-btn",
  coral: "bg-accent-soft text-white hover:opacity-90",
};

export default function PlanCards() {
  return (
    <section className="px-4 pb-6 sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, i) => (
            <FadeUp key={plan.name} delay={0.06 * i}>
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 sm:p-7 ${
                  plan.featured
                    ? "border-island-border bg-island"
                    : "border-border bg-surface shadow-card"
                }`}
              >
                {plan.featured && (
                  <div
                    aria-hidden="true"
                    className="glow-strong pointer-events-none absolute -right-14 -top-14 h-44 w-44 opacity-50"
                  />
                )}

                <div className="relative flex items-start justify-between gap-2">
                  <div>
                    <h3
                      className={`font-heading text-[20px] font-bold ${
                        plan.featured ? "text-island-text" : "text-text-primary"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`mt-1 text-[13px] leading-[18px] ${
                        plan.featured ? "text-island-muted" : "text-text-muted"
                      }`}
                    >
                      {plan.tagline}
                    </p>
                  </div>
                  {plan.badge && (
                    <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-white">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <div className="relative mt-6 min-h-[44px]">{plan.price}</div>

                <Link
                  href={plan.cta.href}
                  className={`relative mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-[14px] font-semibold transition-opacity duration-200 ${ctaClasses[plan.cta.variant]}`}
                >
                  {plan.cta.label}
                </Link>

                <ul className="relative mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2.5 text-[14px] leading-[20px] ${
                        plan.featured ? "text-island-muted" : "text-text-secondary"
                      }`}
                    >
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0 text-accent-text"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          ))}
        </div>

        <p className="mt-6 text-center text-[13px] text-text-muted">
          No credit card to start. AI usage is billed by your own provider,
          never marked up through FlowLens.
        </p>
      </div>
    </section>
  );
}
