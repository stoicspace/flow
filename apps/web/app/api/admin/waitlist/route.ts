// ─────────────────────────────────────────────────────────────
// GET /api/admin/waitlist — landing-page waitlist signups.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { requireAdmin, isAdminError } from "@/lib/billing/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (isAdminError(admin)) return admin;
  const { db } = admin;

  const { data, error } = await db
    .from("flowlens_waitlist")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ waitlist: data ?? [] });
}
