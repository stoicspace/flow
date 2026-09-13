import { Check, Sparkles } from "lucide-react";
import Eyebrow from "./Eyebrow";
import FadeUp from "./Fadeup";

interface PricingTier {
  name: string;
  audience: string;
  price: string;
  priceNote?: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Pro",
    audience: "Solo automation builders, freelancers & power users",
    price: "$19–29",
    priceNote: "/month",
    features: [
      "AI workflow summary",
      "AI review",
      "AI chat",
      "Documentation",
      "Version compare",
      "Knowledge search",
    ],
    cta: "Get Started",
    href: "/signup",
  },
  {
    name: "Team",
    audience: "Startups and internal automation teams",
    price: "$99–299",
    priceNote: "/month",
    features: [
      "Everything in Pro",
      "Shared workspaces",
      "Team comments",
      "Permissions",
      "Review history",
      "Shared documentation",
      "Audit timeline",
    ],
    cta: "Get Started",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Agency",
    audience: "Agencies managing multiple client workflows",
    price: "$299–999",
    priceNote: "/month",
    features: [
      "Everything in Team",
      "Unlimited client workspaces",
      "White-label reports",
      "Client documentation exports",
      "AI optimization reports",
      "Client health dashboard",
    ],
    cta: "Get Started",
    href: "/signup",
  },
  {
    name: "Enterprise",
    audience: "Large organizations with governance & compliance needs",
    price: "Contact us",
    features: [
      "Self-hosted deployment",
      "Docker",
      "Bring your own AI",
      "SSO & SCIM",
      "Audit logs",
      "Dedicated support",
      "SLA",
    ],
    cta: "Contact Sales",
    href: "mailto:spacestoic7@gmail.com?subject=Enterprise%20inquiry",
  },
];

export default function Pricing() {
  return (
    <section className="py-20 sm:py-24 md:py-32" id="pricing">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center text-text-primary">
          <Eyebrow>
            <p className="text-brand-orange">Pricing</p>
          </Eyebrow>

          <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Built to grow with how you automate.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-text-muted max-w-2xl mx-auto">
            From a single builder to a full agency book of clients , pick the
            plan that matches how you use FlowLens today.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier, i) => (
            <FadeUp key={tier.name} delay={i * 0.08}>
              <div
                className={`relative flex h-full flex-col rounded-3xl border p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2 ${
                  tier.highlighted
                    ? "border-brand-orange/50 bg-surface shadow-[0_0_50px_rgba(217,119,87,0.15)]"
                    : "border-border bg-surface hover:border-brand-orange/40"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-brand-orange px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles size={12} />
                    Most popular
                  </span>
                )}

                <h3 className="text-xl sm:text-2xl font-semibold text-text-primary">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-text-muted min-h-[2.5rem]">
                  {tier.audience}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-text-primary">
                    {tier.price}
                  </span>
                  {tier.priceNote && (
                    <span className="text-sm text-text-muted">{tier.priceNote}</span>
                  )}
                </div>

                <ul className="mt-8 space-y-3 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-text-muted">
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-orange" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.href}
                  className={`mt-8 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition ${
                    tier.highlighted
                      ? "bg-brand-orange text-white hover:opacity-90"
                      : "border border-border text-text-primary hover:border-brand-orange/50 hover:text-brand-orange"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            </FadeUp>
          ))}
          
        </div>
        <p className="mt-10 flex items-center justify-center gap-2 text-sm">
  <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-brand-orange">
    Note
  </span>
  <span className="text-text-muted">Pricing might vary after launch</span>
</p>
      </div>
    </section>
  );
}