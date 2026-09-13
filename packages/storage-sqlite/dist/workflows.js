"use strict";
// ─────────────────────────────────────────────────────────────
// packages/storage-sqlite/src/workflows.ts
// SQLite implementation of the same StorageAdapter interface the Supabase
// adapter fulfils — for the Electron desktop app (not built yet). Not
// wired into any running app in this change; it exists so the interface
// is proven against two real backends, not just designed on paper.
//
// Electron is single-tenant by nature (one person, one local database),
// so `teamId` here is accepted for interface compatibility but not used
// to scope rows the way Supabase's RLS-backed queries are — there's only
// ever one team locally. Keeping the parameter (rather than dropping it)
// means API routes written against StorageAdapter don't need an
// edition-specific code path to call these methods.
// ─────────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteStorageAdapter = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const crypto_1 = require("crypto");
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
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    }
    toWorkflow(row) {
        return {
            id: row.id,
            team_id: "local", // single-tenant — see file header note
            name: row.name,
            platform: row.platform,
            external_id: row.external_id,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
    async createWorkflow(_teamId, data) {
        const id = (0, crypto_1.randomUUID)();
        this.db
            .prepare(`INSERT INTO workflows (id, name, platform, external_id, status) VALUES (?, ?, ?, ?, 'unknown')`)
            .run(id, data.name, data.platform, data.external_id ?? null);
        const created = await this.getWorkflow(_teamId, id);
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
    async updateWorkflow(_teamId, id, data) {
        const fields = [];
        const values = [];
        Object.keys(data).forEach(key => {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        });
        fields.push(`updated_at = datetime('now')`);
        this.db.prepare(`UPDATE workflows SET ${fields.join(", ")} WHERE id = ?`).run(...values, id);
        const updated = await this.getWorkflow(_teamId, id);
        if (!updated)
            throw new Error(`Workflow ${id} not found after update`);
        return updated;
    }
    async deleteWorkflow(_teamId, id) {
        this.db.prepare(`DELETE FROM workflows WHERE id = ?`).run(id);
    }
}
exports.SQLiteStorageAdapter = SQLiteStorageAdapter;
