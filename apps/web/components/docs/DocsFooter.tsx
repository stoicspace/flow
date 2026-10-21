const links = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function DocsFooter() {
  return (
    <footer className="border-t border-border px-6 py-6">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 text-[13px] text-text-muted sm:flex-row">
        <p>© 2026 FlowLens</p>
        <nav className="flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="transition-colors hover:text-text-primary"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
