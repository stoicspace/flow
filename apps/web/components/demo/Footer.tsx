import Logo from "./Logo";

interface FooterProps {
  integrationsHref?: string;
}

const columns = (integrationsHref: string) => [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Integrations", href: integrationsHref },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Self-hosted", href: "/docs" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer({
  integrationsHref = "/integrations",
}: FooterProps) {
  const cols = columns(integrationsHref);
  return (
    <footer className="border-t border-border px-4 py-14 sm:px-6 md:py-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <Logo size={26} />
              <span className="font-heading text-[20px] font-bold text-text-primary">
                FlowLens
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-text-muted">
              AI-powered version history and failure explanations for n8n,
              Zapier, and Make.
            </p>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-[14px] font-bold text-text-primary">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[14px] text-text-secondary transition-colors duration-200 hover:text-text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-[13px] text-text-muted">
            © 2026 FlowLens
          </p>
          <p className="text-[13px] text-text-muted">
            Your key. Your infrastructure. Your call.
          </p>
        </div>
      </div>
    </footer>
  );
}
