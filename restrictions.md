I have an existing app (FlowLens, a tool that tracks, diffs, and fixes n8n workflows) with no plan restrictions today. Implement plan-based entitlements and enforcement based on the spec below. First inspect the codebase (auth, user/org model, DB schema, workflow CRUD, version history, diff, fix-suggestion, JSON import, n8n connection/sync, and AI-provider code) and tell me your plan before making big changes.

## Plans and limits

| Capability                         | Free    | Pro     | Team    | Self-hosted |
|------------------------------------|---------|---------|---------|-------------|
| Max workflows                      | 1       | 10      | 20      | Unlimited   |
| Version history retention          | 10 days | 30 days | 50 days | Unlimited   |
| Plain-language diffs               | yes     | yes     | yes     | yes         |
| Proposed fixes                     | yes     | yes     | yes     | yes         |
| Paste JSON import                  | yes     | yes     | yes     | yes         |
| Direct connect + auto sync (n8n)   | no      | no      | yes     | yes         |
| Bring your own AI key / custom self-hosted model endpoint | no | no | no | yes |
| Seats                              | 1       | 1       | 3       | Unlimited   |
| Workflow-based access control (per-workflow permissions)  | no | no | yes | yes |

Pricing: Free $0, Pro $30/mo, Team $100/mo (Pro and Team have a free trial), Self-hosted is contact-sales. AI usage is billed by the user's own provider and is never marked up.

## Requirements

1. **Single source of truth:** create one plan config (e.g. `plans.ts`) holding all limits above, plus helpers like `getEntitlements(account)`, `canUse(account, feature)`, `getLimit(account, limit)`. No hardcoded limits anywhere else.

2. **Data model:** add `plan` (free | pro | team | self_hosted), `plan_status` (active | trialing | past_due | canceled), `trial_ends_at`, and billing IDs if applicable. Default existing accounts to Free with a migration. The subscription belongs to the account/org, not the individual user, so seat limits work for Team.

3. **Server-side enforcement (mandatory):** enforce every limit in the backend/API layer, never only in the UI. Return a consistent error (HTTP 402/403) with `{ code: "PLAN_LIMIT", feature, limit, currentPlan, requiredPlan }`.
   - Workflow cap: block creating, importing, or connecting a workflow beyond the plan's max.
   - Version history: deny or filter versions older than the retention window (query-time filter, plus an optional scheduled cleanup).
   - Direct connect + auto sync: deny for Free and Pro, and make the sync scheduler skip ineligible accounts. Paste JSON import must keep working on every plan.
   - Seats: block invites beyond the seat limit.
   - Workflow-based access control: only Team and Self-hosted can assign per-workflow permissions.
   - BYO AI key / custom model endpoint: only Self-hosted can set it. Other plans use the default AI provider.
   - Proposed fixes, plain-language diffs, and paste JSON import are available on all plans (no gating, but still respect the workflow cap).

4. **Frontend:** fetch entitlements from an endpoint like `/api/me/entitlements` and use them to:
   - show usage meters (e.g. "1 of 1 workflows", "2 of 3 seats"),
   - show gated features as locked with a clear upgrade prompt naming the required plan (Direct connect + auto sync → Team, BYO AI key → Self-hosted, access control → Team),
   - never hide that a feature exists, only show it locked.

5. **Downgrade/expiry behavior:** never delete data on downgrade or trial end.
   - Over-limit workflows become read-only/archived, and the user chooses which to keep active.
   - Stop auto sync for accounts that lose eligibility.
   - Hide history beyond the new retention window without deleting it, so upgrading restores it.
   - If seats exceed the new limit, keep the owner active and let them choose who stays.

6. **Trials:** Pro and Team trials set `plan_status = trialing` with that plan's full access until `trial_ends_at`, then fall back to Free.

7. **Billing hook:** structure it so Stripe (or another provider) webhooks only need to update `plan`, `plan_status`, and `trial_ends_at`. Stub the webhook handler if billing isn't built yet. Add an admin/dev override to set a plan for testing.

8. **Tests:** unit tests for the entitlement helpers, and integration tests proving each restriction is enforced at the API level for each plan. Cover edge cases: exactly at the limit, one over the limit, downgrade with over-limit data, expired trial, Free user attempting direct connect, Pro user attempting direct connect, non-Self-hosted user setting a custom AI endpoint.

## Process
- Start with a short plan listing files to change and the migration.
- Implement in small steps: config → schema/migration → backend enforcement → entitlements endpoint → frontend gating → cleanup job → tests.
- Don't break existing behavior. Existing accounts start on Free, and tell me if any existing account's data exceeds Free limits (more than 1 workflow, auto sync enabled, history older than 10 days, a custom AI key set) so I can decide on grandfathering.
- List anything ambiguous at the end instead of guessing silently.