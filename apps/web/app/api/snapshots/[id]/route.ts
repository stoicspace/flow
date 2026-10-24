import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";
import { loadEntitlements, historyCutoff, planLimitError } from "@/lib/billing/entitlements";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const storage = new SupabaseStorageAdapter(db);
  const snapshot = await storage.getSnapshot(teamId, (await params).id);

  if (!snapshot) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }

  // Plan limit: snapshots older than the retention window are denied
  // (403 PLAN_LIMIT) — hidden from every plan below the one that
  // covers their age, never deleted.
  const ent = await loadEntitlements(db, teamId);
  const cutoff = historyCutoff(ent);
  if (cutoff && snapshot.created_at < cutoff) {
    return NextResponse.json(planLimitError(ent, "history_days"), { status: 403 });
  }

  return NextResponse.json({ snapshot });
}
