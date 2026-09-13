-- ─────────────────────────────────────────────────────────────
-- flowlens_fix_attempts
-- One row per diagnose → operations → validate → apply → test cycle.
-- Powers the "Fix Workflow" MVP loop (see docs/flowlens-mvp.md).
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- ─────────────────────────────────────────────────────────────

create table if not exists flowlens_fix_attempts (
  id                 uuid primary key default gen_random_uuid(),
  workflow_id        uuid not null references flowlens_workflows(id) on delete cascade,
  team_id            uuid not null,

  -- The snapshot this attempt diagnosed / was applied on top of.
  base_snapshot_id   uuid references flowlens_snapshots(id),
  -- The new snapshot created once the fix was applied (null until applied).
  result_snapshot_id uuid references flowlens_snapshots(id),

  -- Retry chain: attempt 1, 2, 3... for the same broken workflow.
  attempt_number     int not null default 1,
  retry_of           uuid references flowlens_fix_attempts(id),

  -- What the user asked for / what error triggered this ("Fix Workflow" click,
  -- or an execution error message).
  user_request       text,
  error_message      text,

  -- AI diagnosis output.
  diagnosis          text,
  reason             text,
  operations         jsonb not null default '[]'::jsonb,

  -- Validator output: { valid: boolean, errors: string[] }
  validation         jsonb,

  -- Test-step output: { passed: boolean, message: string, checks: [...] }
  test_result        jsonb,

  -- proposed -> validated -> applied -> testing -> success | failed
  status             text not null default 'proposed'
                      check (status in ('proposed','validated','applied','testing','success','failed')),

  created_by         uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_fix_attempts_workflow on flowlens_fix_attempts(workflow_id, created_at desc);
create index if not exists idx_fix_attempts_team on flowlens_fix_attempts(team_id);

-- Row Level Security — mirror the pattern used by your other flowlens_* tables.
alter table flowlens_fix_attempts enable row level security;

create policy "team members can read their fix attempts"
  on flowlens_fix_attempts for select
  using (team_id in (select team_id from flowlens_profiles where id = auth.uid()));

create policy "team members can insert fix attempts"
  on flowlens_fix_attempts for insert
  with check (team_id in (select team_id from flowlens_profiles where id = auth.uid()));

create policy "team members can update their fix attempts"
  on flowlens_fix_attempts for update
  using (team_id in (select team_id from flowlens_profiles where id = auth.uid()));
