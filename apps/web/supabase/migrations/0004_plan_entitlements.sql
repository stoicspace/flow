-- ─────────────────────────────────────────────────────────────
-- 0004_plan_entitlements
-- Plan-based entitlements (see restrictions.md and
-- packages/core/src/plans.ts for the rules themselves).
--
-- Adds the subscription fields to flowlens_teams — the account/org,
-- NOT the individual user, so seat limits apply workspace-wide.
--
-- Default is 'free': every existing account becomes Free when this
-- runs. Nothing is deleted. Run the AUDIT QUERIES at the bottom
-- BEFORE deploying enforcement, and decide which existing accounts
-- should be grandfathered (typically a one-time backfill to 'pro'):
--
--   update flowlens_teams set plan = 'pro', plan_status = 'active'
--   where id in ('<team-uuid-1>', '<team-uuid-2>');
-- ─────────────────────────────────────────────────────────────

alter table flowlens_teams
  add column if not exists plan text not null default 'free'
    check (plan in ('free', 'pro', 'team', 'self_hosted')),
  add column if not exists plan_status text not null default 'active'
    check (plan_status in ('active', 'trialing', 'past_due', 'canceled')),
  add column if not exists trial_ends_at timestamptz,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

-- ─────────────────────────────────────────────────────────────
-- AUDIT QUERIES — run these before turning enforcement on.
-- They answer restrictions.md's "tell me if any existing account
-- exceeds Free limits" question.
-- ─────────────────────────────────────────────────────────────

-- 1. Accounts with MORE than 1 workflow (Free cap = 1):
-- select t.id, t.name, count(w.id) as workflows
-- from flowlens_teams t
-- join flowlens_workflows w on w.team_id = t.id
-- group by t.id, t.name
-- having count(w.id) > 1
-- order by workflows desc;

-- 2. Accounts with a direct connection (Free/Pro can't have one):
-- select t.id, t.name, p.platform, p.status
-- from flowlens_teams t
-- join flowlens_platforms p on p.team_id = t.id;

-- 3. Accounts with history older than 10 days (Free retention):
-- select t.id, t.name, count(s.id) as old_snapshots
-- from flowlens_teams t
-- join flowlens_snapshots s on s.team_id = t.id
-- where s.created_at < now() - interval '10 days'
-- group by t.id, t.name;

-- 4. Accounts with a custom AI key set (BYOK = Self-hosted only):
-- select t.id, t.name
-- from flowlens_teams t
-- where t.ai_settings ? 'ai_provider_key_encrypted'
--    or (t.ai_settings->>'ai_provider_endpoint') is not null
--    and t.ai_settings->>'ai_provider_endpoint' <> '';
