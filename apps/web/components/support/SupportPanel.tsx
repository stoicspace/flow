import { MessageSquare, FileText, ExternalLink, Mail } from "lucide-react";
 
interface SupportLink {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  external?: boolean;
}
 
const links: SupportLink[] = [
  {
    icon: <FileText size={16} />,
    title: "Documentation",
    description: "Guides, API reference, and tutorials",
    href: "https://docs.flowlens.io",
    external: true,
  },
  {
    icon: <MessageSquare size={16} />,
    title: "Community",
    description: "Ask questions and share workflows",
    href: "https://community.flowlens.io",
    external: true,
  },
  {
    icon: <Mail size={16} />,
    title: "Email Support",
    description: "support@flowlens.io",
    href: "mailto:support@flowlens.io",
  },
];
 
export default function SupportPanel() {
  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-text-primary mb-1">Support</h1>
        <p className="text-sm text-text-muted">Get help with FlowLens.</p>
      </div>
 
      <div className="space-y-2">
        {links.map(link => (
          <a
            key={link.title}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="flex items-center gap-4 bg-surface-2 border border-border rounded-xl px-4 py-4 hover:border-brand-blue/30 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted flex-shrink-0">
              {link.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{link.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{link.description}</p>
            </div>
            {link.external && <ExternalLink size={14} className="text-text-muted" />}
          </a>
        ))}
      </div>
 
      {/* Quick help */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
          Quick Help
        </p>
        <div className="space-y-2 text-xs text-text-muted">
          <p>→ Import your first workflow from the <a href="/workflows" className="text-brand-brand-orangehover:underline">Import page</a></p>
          <p>→ View failing workflows on the <a href="/dashboard" className="text-brand-brand-orangehover:underline">Dashboard</a></p>
          <p>→ Run AI analysis from any <a href="/investigate" className="text-brand-brand-orangehover:underline">open incident</a></p>
        </div>
      </div>
    </div>
  );
}