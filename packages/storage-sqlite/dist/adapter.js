"use strict";
// ─────────────────────────────────────────────────────────────
// packages/storage-sqlite/src/adapter.ts
// SQLite implementation of the same StorageAdapter interface the Supabase
// adapter fulfils — for the Electron desktop app. Proven against the same
// interface as Supabase, not designed on paper alone.
//
// Electron is single-tenant by nature (one person, one local database), so
// `teamId` is accepted everywhere for interface compatibility but not used
// to scope rows the way Supabase's queries are — there's only ever one
// team locally. Keeping the parameter (rather than dropping it) means API
// routes written against StorageAdapter don't need an edition-specific
// code path to call these methods.
//
// JSON columns: `normalised`, `raw`, `ai_summary`, `ai_review`,
// `suggested_fix`, and `recovery_steps` are all stored as TEXT containing
// JSON.stringify'd data (SQLite has no native JSON/JSONB column type the
// way Postgres does) and parsed back out on read. If a value was never
// set, the column is NULL and read back as `null`, not "null" — checked
// explicitly below rather than relying on JSON.parse(null) accidentally
// working.
// ─────────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteStorageAdapter = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const crypto_1 = require("crypto");
function toJson(value) {
    return value === undefined || value === null ? null : JSON.stringify(value);
}
function fromJson(value) {
    return value === null ? null : JSON.parse(value);
}
class SQLiteStorageAdapter {
    db;
    constructor(dbPath) {
        this.db = new better_sqlite3_1.default(dbPath);
        this.db.pragma("journal_mode = WAL");
        this.runMigrations();
    }
    runMigrations() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        external_id TEXT,
        status TEXT NOT NULL DEFAULT 'unknown',
        last_snapshot_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL REFERENCES workflows(id),
        normalised TEXT NOT NULL,
        raw TEXT NOT NULL,
        source TEXT NOT NULL,
        label TEXT,
        created_by TEXT NOT NULL,
        execution_status TEXT NOT NULL DEFAULT 'unknown',
        error_message TEXT,
        ai_summary TEXT,
        ai_review TEXT,
        ai_documentation TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL REFERENCES workflows(id),
        status TEXT NOT NULL DEFAULT 'open',
        detected_at TEXT NOT NULL DEFAULT (datetime('now')),
        resolved_at TEXT,
        error_message TEXT,
        snapshot_before TEXT REFERENCES snapshots(id),
        snapshot_after TEXT REFERENCES snapshots(id),
        problem TEXT,
        root_cause TEXT,
        confidence REAL,
        business_impact TEXT,
        impact_summary TEXT,
        what_changed TEXT,
        suggested_fix TEXT,
        execution_evidence TEXT,
        recovery_steps TEXT
      );

      CREATE TABLE IF NOT EXISTS change_log (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        snapshot_id TEXT,
        actor_id TEXT NOT NULL,
        actor_type TEXT NOT NULL,
        action TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS fix_attempts (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL REFERENCES workflows(id),
        base_snapshot_id TEXT NOT NULL REFERENCES snapshots(id),
        result_snapshot_id TEXT REFERENCES snapshots(id),
        attempt_number INTEGER NOT NULL,
        retry_of TEXT,
        user_request TEXT,
        error_message TEXT,
        diagnosis TEXT,
        reason TEXT,
        operations TEXT NOT NULL,
        validation TEXT,
        test_result TEXT,
        status TEXT NOT NULL DEFAULT 'proposed',
        created_by TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    }
    // ── Workflows ────────────────────────────────────────────────────────
    toWorkflow(row) {
        return {
            id: row.id,
            team_id: "local",
            name: row.name,
            platform: row.platform,
            external_id: row.external_id,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            last_snapshot_at: row.last_snapshot_at,
        };
    }
    async createWorkflow(teamId, data) {
        const id = (0, crypto_1.randomUUID)();
        this.db
            .prepare(`INSERT INTO workflows (id, name, platform, external_id, status) VALUES (?, ?, ?, ?, 'unknown')`)
            .run(id, data.name, data.platform, data.external_id ?? null);
        const created = await this.getWorkflow(teamId, id);
        if (!created)
            throw new Error("Failed to read back created workflow");
        return created;
    }
    async getWorkflow(_teamId, id) {
        const row = this.db.prepare(`SELECT * FROM workflows WHERE id = ?`).get(id);
        return row ? this.toWorkflow(row) : null;
    }
    async listWorkflows(_teamId) {
        const rows = this.db.prepare(`SELECT * FROM workflows ORDER BY updated_at DESC`).all();
        return rows.map(r => this.toWorkflow(r));
    }
    async updateWorkflow(teamId, id, data) {
        const fields = [];
        const values = [];
        Object.keys(data).forEach(key => {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        });
        fields.push(`updated_at = datetime('now')`);
        this.db.prepare(`UPDATE workflows SET ${fields.join(", ")} WHERE id = ?`).run(...values, id);
        const updated = await this.getWorkflow(teamId, id);
        if (!updated)
            throw new Error(`Workflow ${id} not found after update`);
        return updated;
    }
    async deleteWorkflow(_teamId, id) {
        this.db.prepare(`DELETE FROM workflows WHERE id = ?`).run(id);
    }
    // Single-tenant locally — every workflow "belongs" to the one local
    // team, so this is just a lookup by external_id with no team filter,
    // same shape as the Supabase adapter for interface compatibility.
    async findWorkflowByExternalId(externalId) {
        const row = this.db.prepare(`SELECT * FROM workflows WHERE external_id = ?`).get(externalId);
        return row ? this.toWorkflow(row) : null;
    }
    // ── Snapshots ────────────────────────────────────────────────────────
    toSnapshot(row) {
        return {
            id: row.id,
            team_id: "local",
            workflow_id: row.workflow_id,
            normalised: fromJson(row.normalised),
            raw: fromJson(row.raw),
            source: row.source,
            label: row.label,
            created_by: row.created_by,
            execution_status: row.execution_status,
            error_message: row.error_message,
            created_at: row.created_at,
            ai_summary: fromJson(row.ai_summary),
            ai_review: fromJson(row.ai_review),
            ai_documentation: fromJson(row.ai_documentation),
        };
    }
    toSnapshotSummary(row) {
        return {
            id: row.id,
            team_id: "local",
            workflow_id: row.workflow_id,
            source: row.source,
            label: row.label,
            created_by: row.created_by,
            execution_status: row.execution_status,
            error_message: row.error_message,
            created_at: row.created_at,
        };
    }
    async createSnapshot(teamId, data) {
        const id = (0, crypto_1.randomUUID)();
        this.db
            .prepare(`INSERT INTO snapshots
          (id, workflow_id, normalised, raw, source, label, created_by, execution_status, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(id, data.workflow_id, toJson(data.normalised), toJson(data.raw), data.source, data.label ?? null, data.created_by ?? null, data.execution_status ?? "unknown", data.error_message ?? null);
        const created = await this.getSnapshot(teamId, id);
        if (!created)
            throw new Error("Failed to read back created snapshot");
        return created;
    }
    async getSnapshot(_teamId, id) {
        const row = this.db.prepare(`SELECT * FROM snapshots WHERE id = ?`).get(id);
        return row ? this.toSnapshot(row) : null;
    }
    async listSnapshots(_teamId, workflowId, limit = 50) {
        const rows = this.db
            .prepare(`SELECT * FROM snapshots WHERE workflow_id = ? ORDER BY created_at DESC LIMIT ?`)
            .all(workflowId, limit);
        return rows.map(r => this.toSnapshotSummary(r));
    }
    async updateSnapshot(teamId, id, data) {
        const fields = [];
        const values = [];
        if ("ai_summary" in data) {
            fields.push("ai_summary = ?");
            values.push(toJson(data.ai_summary));
        }
        if ("ai_review" in data) {
            fields.push("ai_review = ?");
            values.push(toJson(data.ai_review));
        }
        if ("ai_documentation" in data) {
            fields.push("ai_documentation = ?");
            values.push(toJson(data.ai_documentation));
        }
        if ("execution_status" in data) {
            fields.push("execution_status = ?");
            values.push(data.execution_status);
        }
        if ("error_message" in data) {
            fields.push("error_message = ?");
            values.push(data.error_message);
        }
        if (fields.length > 0) {
            this.db.prepare(`UPDATE snapshots SET ${fields.join(", ")} WHERE id = ?`).run(...values, id);
        }
        const updated = await this.getSnapshot(teamId, id);
        if (!updated)
            throw new Error(`Snapshot ${id} not found after update`);
        return updated;
    }
    async getLatestSuccessfulSnapshot(_teamId, workflowId) {
        const row = this.db
            .prepare(`SELECT * FROM snapshots WHERE workflow_id = ? AND execution_status = 'success' ORDER BY created_at DESC LIMIT 1`)
            .get(workflowId);
        return row ? this.toSnapshot(row) : null;
    }
    async getLatestSnapshot(_teamId, workflowId) {
        const row = this.db
            .prepare(`SELECT * FROM snapshots WHERE workflow_id = ? ORDER BY created_at DESC LIMIT 1`)
            .get(workflowId);
        return row ? this.toSnapshot(row) : null;
    }
    // ── Incidents ────────────────────────────────────────────────────────
    toIncident(row) {
        return {
            id: row.id,
            team_id: "local",
            workflow_id: row.workflow_id,
            status: row.status,
            detected_at: row.detected_at,
            resolved_at: row.resolved_at,
            error_message: row.error_message,
            snapshot_before: row.snapshot_before,
            snapshot_after: row.snapshot_after,
            problem: row.problem,
            root_cause: row.root_cause,
            confidence: row.confidence,
            business_impact: row.business_impact,
            impact_summary: row.impact_summary,
            what_changed: row.what_changed,
            suggested_fix: fromJson(row.suggested_fix),
            execution_evidence: row.execution_evidence,
            recovery_steps: fromJson(row.recovery_steps),
        };
    }
    async createIncident(teamId, data) {
        const id = (0, crypto_1.randomUUID)();
        this.db
            .prepare(`INSERT INTO incidents (id, workflow_id, status, error_message, snapshot_before, snapshot_after)
         VALUES (?, ?, 'open', ?, ?, ?)`)
            .run(id, data.workflow_id, data.error_message ?? null, data.snapshot_before ?? null, data.snapshot_after ?? null);
        const created = await this.getIncident(teamId, id);
        if (!created)
            throw new Error("Failed to read back created incident");
        return created;
    }
    async getIncident(_teamId, id) {
        const row = this.db.prepare(`SELECT * FROM incidents WHERE id = ?`).get(id);
        return row ? this.toIncident(row) : null;
    }
    async getIncidentWithSnapshots(teamId, id) {
        const incident = await this.getIncident(teamId, id);
        if (!incident)
            return null;
        const [snapshotBefore, snapshotAfter] = await Promise.all([
            incident.snapshot_before ? this.getSnapshot(teamId, incident.snapshot_before) : null,
            incident.snapshot_after ? this.getSnapshot(teamId, incident.snapshot_after) : null,
        ]);
        return { incident, snapshotBefore, snapshotAfter };
    }
    async listIncidents(_teamId, filter = {}) {
        const clauses = [];
        const values = [];
        if (filter.status) {
            clauses.push("status = ?");
            values.push(filter.status);
        }
        if (filter.workflowId) {
            clauses.push("workflow_id = ?");
            values.push(filter.workflowId);
        }
        const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
        const rows = this.db
            .prepare(`SELECT * FROM incidents ${where} ORDER BY detected_at DESC`)
            .all(...values);
        return rows.map(r => this.toIncident(r));
    }
    async updateIncident(teamId, id, data) {
        const fields = [];
        const values = [];
        const jsonKeys = new Set(["suggested_fix", "recovery_steps"]);
        Object.keys(data).forEach(key => {
            fields.push(`${key} = ?`);
            values.push(jsonKeys.has(key) ? toJson(data[key]) : data[key]);
        });
        if (fields.length > 0) {
            this.db.prepare(`UPDATE incidents SET ${fields.join(", ")} WHERE id = ?`).run(...values, id);
        }
        const updated = await this.getIncident(teamId, id);
        if (!updated)
            throw new Error(`Incident ${id} not found after update`);
        return updated;
    }
    // ── Audit log ────────────────────────────────────────────────────────
    async createAuditLogEntry(_teamId, entry) {
        this.db
            .prepare(`INSERT INTO change_log (id, workflow_id, snapshot_id, actor_id, actor_type, action)
         VALUES (?, ?, ?, ?, ?, ?)`)
            .run((0, crypto_1.randomUUID)(), entry.workflow_id, entry.snapshot_id, entry.actor_id, entry.actor_type, entry.action);
    }
    // ── Fix attempts ─────────────────────────────────────────────────────
    toFixAttempt(row) {
        return {
            id: row.id,
            team_id: "local",
            workflow_id: row.workflow_id,
            base_snapshot_id: row.base_snapshot_id,
            result_snapshot_id: row.result_snapshot_id,
            attempt_number: row.attempt_number,
            retry_of: row.retry_of,
            user_request: row.user_request,
            error_message: row.error_message,
            diagnosis: row.diagnosis,
            reason: row.reason,
            operations: fromJson(row.operations) || [],
            validation: fromJson(row.validation),
            test_result: fromJson(row.test_result),
            status: row.status,
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
    async createFixAttempt(teamId, data) {
        const id = (0, crypto_1.randomUUID)();
        this.db
            .prepare(`INSERT INTO fix_attempts
          (id, workflow_id, base_snapshot_id, attempt_number, retry_of, user_request,
           error_message, diagnosis, reason, operations, validation, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(id, data.workflow_id, data.base_snapshot_id, data.attempt_number, data.retry_of ?? null, data.user_request ?? null, data.error_message ?? null, data.diagnosis ?? null, data.reason ?? null, toJson(data.operations), toJson(data.validation), data.status, data.created_by ?? null);
        const created = await this.getFixAttempt(teamId, data.workflow_id, id);
        if (!created)
            throw new Error("Failed to read back created fix attempt");
        return created;
    }
    async getFixAttempt(_teamId, workflowId, id) {
        const row = this.db
            .prepare(`SELECT * FROM fix_attempts WHERE id = ? AND workflow_id = ?`)
            .get(id, workflowId);
        return row ? this.toFixAttempt(row) : null;
    }
    async listFixAttempts(_teamId, workflowId, limit = 20) {
        const rows = this.db
            .prepare(`SELECT * FROM fix_attempts WHERE workflow_id = ? ORDER BY created_at DESC LIMIT ?`)
            .all(workflowId, limit);
        return rows.map(r => this.toFixAttempt(r));
    }
    async updateFixAttempt(_teamId, id, data) {
        const fields = [];
        const values = [];
        if ("result_snapshot_id" in data) {
            fields.push("result_snapshot_id = ?");
            values.push(data.result_snapshot_id);
        }
        if ("test_result" in data) {
            fields.push("test_result = ?");
            values.push(toJson(data.test_result));
        }
        if ("status" in data) {
            fields.push("status = ?");
            values.push(data.status);
        }
        fields.push(`updated_at = datetime('now')`);
        this.db.prepare(`UPDATE fix_attempts SET ${fields.join(", ")} WHERE id = ?`).run(...values, id);
        const row = this.db.prepare(`SELECT * FROM fix_attempts WHERE id = ?`).get(id);
        if (!row)
            throw new Error(`Fix attempt ${id} not found after update`);
        return this.toFixAttempt(row);
    }
}
exports.SQLiteStorageAdapter = SQLiteStorageAdapter;
