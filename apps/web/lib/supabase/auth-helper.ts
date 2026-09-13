// src/lib/supabase/auth-helper.ts
import { createClient, createServiceClient } from "./server";
import { NextResponse } from "next/server";

export interface AuthContext {
  user: { id: string };
  teamId: string;
  role: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
  db: ReturnType<typeof createServiceClient>;
  error?: never;
}

export interface AuthError {
  error: NextResponse;
  user?: never;
  teamId?: never;
}
export async function getAuthContext(): Promise<AuthContext | AuthError> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // ← only this line changes: db instead of supabase
  const db = createServiceClient();

  const { data: profile, error: profileError } = await db
    .from("flowlens_profiles")
    .select("team_id, role")
    .eq("id", user.id)
    .single();

  

  if (!profile?.team_id) {
    return {
      error: NextResponse.json({ error: "No team assigned" }, { status: 403 }),
    };
  }

  return {
    user,
    teamId: profile.team_id,
    role: profile.role,
    supabase,
    db,
  };
}