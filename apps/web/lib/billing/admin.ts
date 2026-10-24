// ─────────────────────────────────────────────────────────────
// src/lib/billing/admin.ts
// Platform-admin auth for the /admin dashboard and /api/admin/*.
//
// Simple username/password kept in .env (nothing in the database,
// no relation to regular FlowLens user accounts):
//
//   ADMIN_USERNAME=admin
//   ADMIN_PASSWORD=change-me
//
// Login happens at /admin/login; on success we set an httpOnly
// cookie holding a SHA-256 of the credentials. The server can
// always recompute the expected hash from env to verify it —
// the cookie never contains the password itself.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";

export const ADMIN_COOKIE = "flowlens_admin_token";

// The hash a correct login produces. Also what we compare cookies to.
function expectedToken(): string | null {
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  if (!u || !p) return null; // not configured → admin is locked for everyone
  return adminToken(u, p);
}

// Cookie value for a given username/password pair (SHA-256, so the
// cookie never contains the password itself).
export function adminToken(username: string, password: string): string {
  return createHash("sha256").update(`${username}:${password}`).digest("hex");
}

// Login form → API route: verify the submitted credentials.
export function checkCredentials(username: string, password: string): boolean {
  const expected = expectedToken();
  if (!expected) return false;
  // Hash both sides then compare — constant-time enough for this.
  return adminToken(username, password) === expected;
}

// Is there a valid admin cookie on this request? (Used by pages.)
export async function isAdminLoggedIn(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  const expected = expectedToken();
  return !!expected && !!value && value === expected;
}

// What the login/logout API routes set on success.
// NOTE: no `secure` flag — the app is often run locally over plain
// http (next start), and a Secure cookie would never be sent back
// there, locking admins out. HttpOnly + SameSite=Lax still apply;
// add `secure: true` if you only ever serve admin over HTTPS.
export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// API-route guard: returns the service DB handle when logged in as
// admin, otherwise a 403 response to return immediately.
export async function requireAdmin(): Promise<{ db: any } | NextResponse> {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ error: "Admin login required" }, { status: 403 });
  }
  return { db: createServiceClient() };
}

export function isAdminError(x: any): x is NextResponse {
  return x instanceof NextResponse;
}
