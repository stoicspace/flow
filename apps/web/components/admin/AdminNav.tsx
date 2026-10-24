// ─────────────────────────────────────────────────────────────
// components/admin/AdminNav.tsx
// Top bar of /admin: section tabs + logout.
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/accounts", label: "Accounts" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/incidents", label: "Incidents" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-surface-2">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold text-text-primary">
            FlowLens <span className="text-brand-orange">Admin</span>
          </span>
          <nav className="flex gap-1">
            {TABS.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-brand-orange/15 text-brand-orange font-medium"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:border-brand-orange/50 transition"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </header>
  );
}
