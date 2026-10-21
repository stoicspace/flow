"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { articles, GROUP_ORDER, hrefFor, type Article } from "@/lib/docs/articles";

const byGroup = GROUP_ORDER.map((g) => ({
  group: g,
  items: articles.filter((a) => a.group === g),
}));

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden self-start pb-10 pt-1 lg:sticky lg:top-28 lg:block">
      <nav className="space-y-7">
        {byGroup.map(({ group, items }) => (
          <div key={group}>
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted">
              {group}
            </p>
            <ul className="mt-2 space-y-0.5">
              {items.map((item: Article) => {
                const href = hrefFor(item.slug);
                const active = pathname === href;
                return (
                  <li key={item.slug}>
                    <Link
                      href={href}
                      className={`block rounded-lg px-3 py-2 text-[14px] transition-colors ${
                        active
                          ? "bg-chip font-semibold text-text-primary"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {item.sidebar}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
