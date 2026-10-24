// ─────────────────────────────────────────────────────────────
// src/app/(admin)/layout.tsx
// Shell for the /admin dashboard. Has its OWN login (username +
// password from .env) — no FlowLens user session needed.
// Not logged in → the login form is all you get.
// ─────────────────────────────────────────────────────────────

import { isAdminLoggedIn } from "@/lib/billing/admin";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = { title: "FlowLens Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminLoggedIn();

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <AdminLogin />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <AdminNav />
      <main className="mx-auto max-w-[1200px] p-6 md:p-8">{children}</main>
    </div>
  );
}
