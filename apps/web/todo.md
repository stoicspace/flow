# FlowLens Desktop — TODO Plan

> **Mission:** Ship FlowLens as a secure, installable desktop application.  
> Users bring their own AI API key (BYOK) or use ours via a plan.  
> All workflow data stays on their machine. Code is protected and cannot be extracted or tampered with.

---

## Priority Order

```
Phase 1 → AI Provider Abstraction (unlock BYOK)
Phase 2 → FlowLens Core extraction (portable, testable, desktop-ready)
Phase 3 → Storage layer (SQLite for local, swap Supabase out)
Phase 4 → Electron shell (packaging, IPC, security)
Phase 5 → Code protection (obfuscation, signing, license)
Phase 6 → Local AI (optional Hugging Face model for fully offline use)
Phase 7 → Distribution (installers, auto-update, stores)
```

---

## Phase 1 — AI Provider Abstraction (BYOK Foundation)

> **Why first:** Every other phase depends on this. BYOK is the entire value proposition for local users — they don't want their workflow data leaving their machine through our API key.

### 1.1 Define AI Provider Interface

- [ ] Create `lib/ai/provider.interface.ts` with a shared contract all providers implement
- [ ] Define `complete(prompt, options)` → `string` method
- [ ] Define `stream(messages, options)` → `ReadableStream` method  
- [ ] Define `healthCheck()` → `{ ok: boolean; latency: number }` method
- [ ] Define `validateKey(apiKey)` → `boolean` method — lets UI verify the key before saving
- [ ] Define provider metadata: `name`, `models[]`, `requiresKey`, `supportsStreaming`, `supportsJSON`

### 1.2 Implement Providers

- [ ] **OpenRouter provider** — wrap current `lib/services/ai.ts` calls behind the interface
- [ ] **OpenAI provider** — `gpt-4o-mini` as default, user provides key
- [ ] **Anthropic provider** — `claude-haiku-3-5` as default, user provides key  
- [ ] **Google AI provider** — `gemini-2.0-flash` via AI Studio, user provides key
- [ ] **FlowLens Cloud provider** — our key, billed through our plan (for users who don't want BYOK)
- [ ] **Local model provider** — Ollama-compatible HTTP endpoint, no key needed (Phase 6)

### 1.3 Model Selection

- [ ] Remove hard-coded `MODEL` constant from `lib/services/ai.ts`
- [ ] Read model from `FLOWLENS_AI_MODEL` env var with sane default per provider
- [ ] Expose model selection in Settings UI → AI tab
- [ ] Show model cost estimate next to each option (tokens/$ per 1M)
- [ ] Allow per-feature model override (e.g. use cheaper model for summaries, better model for repair)

### 1.4 Key Management (BYOK)

- [ ] Create `lib/ai/keystore.ts` — secure storage for user-provided API keys
- [ ] In desktop app: store keys in OS keychain (`keytar` package) — never in plain files
- [ ] In cloud app: store encrypted in Supabase (AES-256-GCM, already partially done)
- [ ] Add `POST /api/settings/ai` route to save/update key (cloud)
- [ ] Add IPC handler `ai:saveKey` in Electron main process (desktop)
- [ ] Validate key on save — call provider `validateKey()` before storing
- [ ] Show key health indicator in Settings: valid / invalid / quota exceeded
- [ ] Never log or expose keys in error messages or console output
- [ ] Mask key display: show only last 4 chars in UI

### 1.5 Reliability

- [ ] Add timeout per AI call (default 30s, configurable)
- [ ] Add retry with exponential backoff (max 3 attempts, 429 and 503 only)
- [ ] Add fallback provider — if primary fails, try secondary (e.g. OpenRouter → OpenAI)
- [ ] Validate AI JSON output against Zod schemas before use — reject malformed responses
- [ ] Add provider health check endpoint `GET /api/ai/health` for status page

---

## Phase 2 — FlowLens Core Extraction

> **Why:** Desktop app needs the same workflow intelligence as the cloud app. Extracting it into a standalone package means it works in Electron without Next.js, can be tested independently, and can be published as an npm package later.

### 2.1 Create `@flowlens/core` Package

- [ ] Create `packages/core/` directory in monorepo (or `flowlens-core/` standalone)
- [ ] Move `lib/services/normalizer.ts` → `packages/core/normalizer.ts`
- [ ] Move `lib/services/diff.ts` → `packages/core/diff.ts`
- [ ] Move `lib/services/repairEngine.ts` → `packages/core/repairEngine.ts`
- [ ] Move `lib/services/repairValidator.ts` → `packages/core/repairValidator.ts`
- [ ] Move `lib/services/repairTest.ts` → `packages/core/repairTest.ts`
- [ ] Move `types/flowlens.ts` → `packages/core/types.ts`
- [ ] Export clean public API from `packages/core/index.ts`
- [ ] Zero Next.js dependencies in core — pure TypeScript, no framework coupling
- [ ] Add unit tests for normalizer, diff, repair engine, validator

### 2.2 Snapshot Module

- [ ] Extract snapshot logic from `/api/snapshots/*` routes into `packages/core/snapshot.ts`
- [ ] Define `createSnapshot(workflow, source)` → `Snapshot`
- [ ] Define `restoreSnapshot(snapshotId, storage)` → `Snapshot`
- [ ] Define `diffSnapshots(snapshotA, snapshotB)` → `WorkflowDiff`

### 2.3 Incident Module

- [ ] Extract incident logic from webhook routes into `packages/core/incident.ts`
- [ ] Define `detectIncident(snapshot, previousSnapshot)` → `Incident | null`
- [ ] Define `resolveIncident(incidentId, resolution)` → `void`

---

## Phase 3 — Storage Abstraction

> **Why:** Cloud uses Supabase. Desktop uses SQLite. The same core logic must work with both. The app should not know or care which storage is underneath.

### 3.1 Define Storage Interface

- [ ] Create `packages/core/storage/interface.ts`
- [ ] `createWorkflow(data)` → `Workflow`
- [ ] `getWorkflow(id)` → `Workflow | null`
- [ ] `updateWorkflow(id, data)` → `Workflow`
- [ ] `deleteWorkflow(id)` → `void`
- [ ] `createSnapshot(data)` → `Snapshot`
- [ ] `getSnapshot(id)` → `Snapshot | null`
- [ ] `listSnapshots(workflowId, limit)` → `Snapshot[]`
- [ ] `createIncident(data)` → `Incident`
- [ ] `getIncident(id)` → `Incident | null`
- [ ] `updateIncident(id, data)` → `Incident`
- [ ] `createAuditLog(data)` → `void`
- [ ] `getAuditLog(workflowId, limit)` → `AuditEntry[]`

### 3.2 Supabase Adapter (Cloud)

- [ ] Create `packages/storage-supabase/index.ts` implementing the storage interface
- [ ] Migrate all direct Supabase calls from API routes to go through this adapter
- [ ] Keep RLS policies — adapter uses anon key for user queries, service key for admin ops

### 3.3 SQLite Adapter (Desktop)

- [ ] Create `packages/storage-sqlite/index.ts` implementing the storage interface
- [ ] Use `better-sqlite3` — synchronous API, works well in Electron main process
- [ ] Define schema migrations in `packages/storage-sqlite/migrations/`
- [ ] Run migrations on app start automatically
- [ ] Store SQLite database at `app.getPath('userData')/flowlens.db`
- [ ] Encrypt the database file at rest using `SQLCipher` — key derived from machine ID

---

## Phase 4 — Electron Shell

> **Why:** This is the actual desktop app. Electron wraps the Next.js UI and runs the core logic natively.

### 4.1 Electron Setup

- [ ] Initialize Electron app alongside Next.js in the repo
- [ ] Use `electron-builder` for packaging
- [ ] Use `electron-vite` or `@electron-forge/plugin-webpack` for bundling
- [ ] Set up `main/`, `preload/`, `renderer/` Electron directory structure
- [ ] Configure Next.js to export statically (`next export`) for Electron renderer

### 4.2 Secure IPC (Main ↔ Renderer)

- [ ] Enable `contextIsolation: true` on all BrowserWindows — mandatory
- [ ] Enable `nodeIntegration: false` on all BrowserWindows — mandatory
- [ ] Create `preload.ts` that exposes only explicitly whitelisted IPC channels
- [ ] Define IPC channel whitelist — no wildcard access, each channel named and typed
- [ ] IPC channels needed:
  - [ ] `ai:saveKey(provider, key)` → saves to OS keychain
  - [ ] `ai:getKeyStatus(provider)` → returns valid/invalid/missing
  - [ ] `ai:deleteKey(provider)` → removes from keychain
  - [ ] `db:query(operation, params)` → proxies storage interface calls
  - [ ] `workflow:import(json)` → normalise and store workflow
  - [ ] `workflow:export(id)` → return workflow JSON for user download
  - [ ] `app:version()` → return current app version
  - [ ] `app:checkUpdate()` → trigger update check
  - [ ] `license:validate(key)` → validate license key
  - [ ] `license:getStatus()` → return plan and expiry

### 4.3 Main Process Architecture

- [ ] Run FlowLens Core in the main process — never send raw workflow JSON through IPC
- [ ] Run SQLite storage in the main process — renderer never touches the DB directly
- [ ] Run AI calls in the main process — API keys never leave main process
- [ ] Run local model inference in the main process (Phase 6)
- [ ] All renderer → main communication goes through typed IPC handlers only

### 4.4 Security Hardening

- [ ] Set `Content-Security-Policy` header on all windows
- [ ] Disable `allowRunningInsecureContent`
- [ ] Disable `webSecurity: false` — never set this
- [ ] Validate all IPC inputs before processing — treat renderer as untrusted
- [ ] Never expose `shell.openExternal` to renderer directly — whitelist allowed URLs
- [ ] Disable DevTools in production builds
- [ ] Block navigation to external URLs in the main window

### 4.5 Local n8n Connector

- [ ] Create `lib/connections/local-n8n.ts`
- [ ] Connect to n8n's local REST API (`http://localhost:5678/api/v1/`)
- [ ] Fetch workflow list from local n8n instance
- [ ] Fetch specific workflow JSON by ID
- [ ] Subscribe to n8n execution events via polling or webhook
- [ ] Store user's local n8n URL and API key via IPC → main process → keychain
- [ ] Auto-detect if n8n is running locally on app start

---

## Phase 5 — Code Protection and Licensing

> **Why:** Desktop apps ship binary + source. Without protection, anyone can extract the source, remove the license check, and run FlowLens for free. This is the main commercial risk of a desktop product.

### 5.1 Code Obfuscation

- [ ] Add `javascript-obfuscator` to the build pipeline for the Electron main process
- [ ] Obfuscate `main/`, `preload/`, and `packages/core/` bundles
- [ ] Settings: `controlFlowFlattening: true`, `stringEncryption: true`, `deadCodeInjection: true`
- [ ] Do NOT obfuscate renderer/UI code — it runs in Chromium, obfuscation adds no security there
- [ ] Test that obfuscated build still functions correctly before every release

### 5.2 License System

- [ ] Create license key format: `FL-XXXX-XXXX-XXXX-XXXX` (UUID-based, signed)
- [ ] Create `lib/license/validator.ts`
  - [ ] Offline validation — validate key signature without network call (Ed25519 signature)
  - [ ] Online validation — call FlowLens license server to check revocation + plan details
  - [ ] Grace period — allow 7 days offline before requiring online revalidation
- [ ] License tiers:
  - [ ] `free` — limited workflows (3), no repair engine, no BYOK
  - [ ] `pro` — unlimited workflows, full repair engine, BYOK
  - [ ] `lifetime` — pro forever, one payment
- [ ] Store validated license in OS keychain (not a plain file)
- [ ] Check license on app start and every 24h while running
- [ ] Show license status in Settings → License tab
- [ ] Graceful degradation on expired license — lock pro features, don't crash

### 5.3 Anti-Tampering

- [ ] Verify app binary integrity on start using a hash of critical files
- [ ] If integrity check fails, show warning and refuse to start (don't silently run tampered code)
- [ ] Sign the Electron main process bundle with a checksum stored separately
- [ ] Use `asar` archive for app files with integrity checking enabled

### 5.4 Code Signing

**Windows:**
- [ ] Obtain EV Code Signing certificate (required for SmartScreen trust)
- [ ] Sign all `.exe` and `.dll` files with `signtool`
- [ ] Sign the installer (`.exe`) separately
- [ ] Test SmartScreen response — unsigned builds will be blocked by Windows Defender

**macOS:**
- [ ] Enroll in Apple Developer Program
- [ ] Sign app bundle with Developer ID certificate
- [ ] Submit to Apple for notarization via `notarytool`
- [ ] Staple the notarization ticket to the `.app` bundle
- [ ] Test Gatekeeper acceptance on a clean macOS machine

### 5.5 Build Pipeline Security

- [ ] Store signing certificates in CI secrets — never in the repo
- [ ] Build only on CI (GitHub Actions) — no local signing
- [ ] Separate signing from build steps — build unsigned, then sign in separate job
- [ ] Store `OPENROUTER_API_KEY` / `GOOGLE_AI_KEY` as CI secrets — inject at build time
- [ ] Never ship a build with a hardcoded API key from us — use BYOK or license server

---

## Phase 6 — Local AI (Fully Offline)

> **Why:** Some users want zero data leaving their machine — not even to OpenAI. Local model inference makes FlowLens usable in air-gapped environments.

### 6.1 Model Selection

- [ ] Benchmark candidate models for workflow repair accuracy:
  - [ ] `Qwen2.5-Coder-7B-Instruct` (good at structured JSON output, small)
  - [ ] `Phi-3.5-mini-instruct` (very small, fast on CPU)
  - [ ] `Mistral-7B-Instruct-v0.3` (general, reliable JSON)
- [ ] Minimum requirements: produces valid JSON from repair prompts, runs on 8GB RAM
- [ ] Document VRAM/RAM requirements per model for user system requirements page

### 6.2 Inference Runtime

- [ ] Evaluate `ollama` — best UX, user installs separately, FlowLens talks to local HTTP endpoint
- [ ] Evaluate `llama.cpp` via Node.js bindings — bundled, no separate install, more complex
- [ ] **Recommended:** Start with Ollama — user installs it, FlowLens auto-detects it at `http://localhost:11434`
- [ ] Create `packages/core/ai/providers/ollama.ts` implementing AI provider interface
- [ ] Auto-detect Ollama on app start, show setup guide if not found
- [ ] Allow user to specify custom Ollama URL in settings (for remote Ollama)

### 6.3 Model Management

- [ ] Show available models from Ollama in Settings → AI → Local Models
- [ ] One-click pull recommended model through FlowLens UI (calls Ollama pull API)
- [ ] Show download progress for model pull
- [ ] Show model size on disk
- [ ] Let user delete models they no longer use

### 6.4 Offline Validation

- [ ] Test all 9 AI functions (summary, review, optimize, document, repair, diff explain, search, chat, deploy check) against local model
- [ ] Define acceptable quality threshold — repair plan must produce valid operations >80% of time
- [ ] If local model fails quality bar for a specific function, fall back to cloud model with user prompt

---

## Phase 7 — Distribution

### 7.1 Installers

**Windows:**
- [ ] Build NSIS installer (`.exe`) — standard Windows install experience
- [ ] Install to `C:\Program Files\FlowLens\`
- [ ] Add to Windows Add/Remove Programs
- [ ] Create Start Menu shortcut
- [ ] Create Desktop shortcut (optional during install)
- [ ] Uninstaller that removes all app files (not user data unless explicitly chosen)

**macOS:**
- [ ] Build `.dmg` with drag-to-Applications UX
- [ ] Include app icon and background image in DMG
- [ ] Universal binary — single build runs on Apple Silicon and Intel

**Linux (later):**
- [ ] `.AppImage` — runs on most distros without install
- [ ] `.deb` for Debian/Ubuntu
- [ ] Snap (optional)

### 7.2 Auto-Update

- [ ] Use `electron-updater` (part of `electron-builder`)
- [ ] Host update manifest on GitHub Releases or S3
- [ ] Check for updates on app start (silent) and every 4 hours while running
- [ ] Show update notification in app: "FlowLens X.Y.Z is available — update now / later"
- [ ] Download update in background, apply on next restart
- [ ] Delta updates if possible — don't re-download entire app for small changes
- [ ] Rollback mechanism — if new version crashes on start, revert to previous

### 7.3 First Run Experience

- [ ] Show welcome screen on first launch
- [ ] Step 1: Choose AI mode — BYOK (enter API key) or FlowLens Cloud (sign in)
- [ ] Step 2: Connect first workflow — paste JSON, or connect local n8n
- [ ] Step 3: Import and see AI summary — first "wow" moment
- [ ] Skip option on each step — don't force completion

### 7.4 Crash Reporting

- [ ] Integrate `electron-unhandled` for uncaught main process errors
- [ ] Send crash reports to Sentry with user permission (opt-in on first launch)
- [ ] Never include workflow JSON or API keys in crash reports
- [ ] Strip all PII before sending

---

## Immediate Next Actions (Start Here)

These are the first 5 things to actually build — everything else is blocked on them:

1. **Fix the AI 500 error** — switch `MODEL` in `lib/services/ai.ts` from `google/gemma-4-26b-a4b-it:free` to a working paid model (`google/gemini-2.0-flash-001` or `openai/gpt-4o-mini`). This is blocking the entire product.

2. **Build AI provider interface** — create `lib/ai/provider.interface.ts` and wrap the current OpenRouter calls behind it. This unlocks BYOK without breaking anything.

3. **Build BYOK settings UI** — Settings → AI tab where user enters their API key. Validate on save. Store encrypted. This is the core desktop value prop.

4. **Extract FlowLens Core** — move normalizer, diff, repair engine into `packages/core/`. This is required before Electron can use them without Next.js.

5. **SQLite storage adapter** — once core is extracted, swap Supabase for SQLite in a local build. This is the last thing blocking a working local-only version.

---

## Architecture Summary

```
FLOWLENS DESKTOP
      │
      ├── Electron Main Process (Node.js, protected)
      │     ├── FlowLens Core (normalizer, diff, repair, snapshot)
      │     ├── AI Provider (BYOK key from OS keychain)
      │     ├── SQLite Storage (encrypted, local)
      │     ├── License Validator (Ed25519 signature)
      │     └── IPC Handlers (typed, whitelisted)
      │
      ├── Electron Preload (contextIsolation bridge)
      │     └── Exposes only whitelisted IPC channels to renderer
      │
      └── Renderer (Next.js static export, Chromium)
            └── Same UI as cloud — no direct DB or AI access
```

---

## Completion Tracker

| Phase | Items | Done | Remaining |
|-------|-------|------|-----------|
| 1. AI Provider + BYOK | 24 | 0 | 24 |
| 2. FlowLens Core | 14 | 0 | 14 |
| 3. Storage Abstraction | 20 | 0 | 20 |
| 4. Electron Shell | 26 | 0 | 26 |
| 5. Code Protection | 20 | 0 | 20 |
| 6. Local AI | 16 | 0 | 16 |
| 7. Distribution | 22 | 0 | 22 |
| **TOTAL** | **142** | **0** | **142** |

---

*Last updated: based on FLOWLENS-ROADMAP.md audit + desktop plan*