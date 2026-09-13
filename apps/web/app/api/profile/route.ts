// ============================================================
// FILE 1: src/app/api/profile/route.ts
// GET /api/profile  — get current user profile
// PATCH /api/profile — update display_name
// ============================================================

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, db } = ctx;

  const { data: profile, error } = await db
  .from("flowlens_profiles")
  .select("name, email, role, team_id, flowlens_teams(name)")
  .eq("id", user.id)
  .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
  profile: {
    id: user.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    team_name: (profile as any).flowlens_teams?.name ?? "My Team",
    team_id: profile.team_id,
  },
});
}

export async function PATCH(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, db } = ctx;

  const { name } = await request.json();

  if (!name?.trim()) {
  return NextResponse.json(
    { error: "Name is required" },
    { status: 400 }
  );
}

  const { data, error } = await db
  .from("flowlens_profiles")
  .update({
    name: name.trim(),
  })
  .eq("id", user.id)
  .select("name, email, role")
  .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

