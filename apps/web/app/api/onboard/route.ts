// ============================================================
// FLOWLENS — ALL API ROUTE HANDLERS
// Copy each section into the correct file path shown above it
// ============================================================

// ─────────────────────────────────────────────────────────────
// src/app/api/onboard/route.ts
// POST /api/onboard — creates team + profile after signup
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { userId, displayName, teamName, password, email, role } = await request.json();

    if (!userId || !teamName) {
      return NextResponse.json(
        { error: "userId and teamName are required" },
        { status: 400 }
      );
    }

    const db = createServiceClient();

    // Create team
    const { data: team, error: teamErr } = await db
      .from("flowlens_teams")
      .insert({ name: teamName })
      .select()
      .single();

    if (teamErr) {
      return NextResponse.json({ error: teamErr.message }, { status: 500 });
    }

    const { error: profileErr } = await db.from("flowlens_profiles").insert({
      id: userId,
      team_id: team.id,
      name: displayName,
      role: role,
      password: password,
      email: email,
    });

    if (profileErr) {
      console.error(profileErr);

      return NextResponse.json(
        { error: profileErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ team }, { status: 201 });
  } catch (e) {
    console.error("Onboarding failed:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

