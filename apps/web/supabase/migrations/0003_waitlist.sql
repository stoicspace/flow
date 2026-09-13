-- ─────────────────────────────────────────────────────────────
-- flowlens_waitlist
-- Landing-page waitlist signups. Previously /api/waitlist validated the
-- email and returned success but never stored it anywhere (console.log
-- only) — every signup was silently lost. This table + the updated route
-- fix that.
-- ─────────────────────────────────────────────────────────────

create table if not exists flowlens_waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_waitlist_created_at on flowlens_waitlist(created_at desc);

-- Public, unauthenticated signup form — RLS enabled with no policies means
-- the anon/authenticated roles get zero direct access; all reads/writes to
-- this table go through the service-role client in /api/waitlist, same
-- pattern as every other flowlens_* table in this app.
alter table flowlens_waitlist enable row level security;
