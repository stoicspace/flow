-- ─────────────────────────────────────────────────────────────
-- Widen flowlens_snapshots_source_check to allow 'ai_fix' as a source,
-- so snapshots created by the Fix Workflow apply step can be stored.
--
-- Confirmed current constraint (as of this migration):
--   CHECK (source = ANY (ARRAY['webhook','manual','import','api']))
--
-- This adds 'ai_fix' on top of the existing four values without removing
-- any of them.
-- ─────────────────────────────────────────────────────────────

alter table flowlens_snapshots
  drop constraint if exists flowlens_snapshots_source_check;

alter table flowlens_snapshots
  add constraint flowlens_snapshots_source_check
  check (source in ('webhook', 'manual', 'import', 'api', 'ai_fix'));
