// ─────────────────────────────────────────────────────────────
// POST /api/admin/login
// Body: { username, password } — checked against ADMIN_USERNAME /
// ADMIN_PASSWORD in .env. Success sets the admin cookie.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import {
  checkCredentials,
  adminToken,
  adminCookieOptions,
  ADMIN_COOKIE,
} from "@/lib/billing/admin";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  if (!checkCredentials(username, password)) {
    // Small delay so brute-forcing feels painful (not a real rate
    // limit, just a speed bump).
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json(
      { error: "Wrong username or password" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(username, password), adminCookieOptions);
  return res;
}
