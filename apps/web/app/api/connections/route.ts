// app/api/connections/route.ts
// REPLACES your current file entirely.

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";

export async function GET() {
const ctx = await getAuthContext();
if (ctx.error) return ctx.error;
const { teamId, db } = ctx; // was: const { teamId, supabase } = ctx;

const { data, error } = await db // was: supabase
  .from("flowlens_platforms")
  .select("id, platform, name, status, last_sync, base_url")
  .eq("team_id", teamId)
  .order("created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    connections: data.map((c) => ({
      id: c.id,
      name: c.platform, // matches page.tsx's row.name.toLowerCase() === platform lookup
      status: c.status,
      lastSync: c.last_sync ? new Date(c.last_sync).toLocaleString() : null,
      // NOTE: flowlens_platforms has no error_message column today. If you
      // want per-connection error text on the card (the ConnectionCard
      // errorMsg prop already supports it), add one:
      //   alter table flowlens_platforms add column error_message text;
      // and set it in sync/route.ts's catch block instead of just
      // flipping status to "error". Until then this is always null.
      errorMsg: null,
      // api_key and webhook_secret are intentionally NOT selected above —
      // don't add them to the select() or this leaks again.
    })),
  });
}
