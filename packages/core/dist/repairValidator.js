"use strict";
// ─────────────────────────────────────────────────────────────
// src/lib/services/repairValidator.ts
// The "Validator" step: checks AI-proposed operations are structurally
// sound against the *real* workflow before repairEngine ever touches it.
// Pure function — no AI calls, no DB, fully unit-testable.
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOperations = normalizeOperations;
exports.validateOperations = validateOperations;
const ALLOWED_TYPES = new Set([
    "ADD_RETRY",
    "ADD_TIMEOUT",
    "SET_CONFIG_FIELD",
    "ADD_ERROR_HANDLER",
    "FIX_DATA_MAPPING",
]);
function slugify(label) {
    return label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}
// ── Normalize ────────────────────────────────────────────────────────────
// The AI reliably fills in handlerLabel ("Handle Payment Failure") but
// sometimes drops handlerNodeId even though the schema requires both — the
// label alone is enough to derive a safe, unique id deterministically, so
// self-heal it here rather than bouncing a good proposal back to the model
// (or worse, silently failing) for a field we can trivially compute.
// Pure + idempotent — safe to call even when nothing needs fixing.
function normalizeOperations(workflow, operations) {
    const existingIds = new Set(workflow.nodes.map(n => n.id));
    const claimedIds = new Set();
    return operations.map(op => {
        if (op.type !== "ADD_ERROR_HANDLER" || op.handlerNodeId || !op.handlerLabel) {
            if (op.handlerNodeId)
                claimedIds.add(op.handlerNodeId);
            return op;
        }
        const base = slugify(op.handlerLabel) || `handler_${op.nodeId}`;
        let candidate = base;
        let suffix = 1;
        while (existingIds.has(candidate) || claimedIds.has(candidate)) {
            candidate = `${base}_${suffix++}`;
        }
        claimedIds.add(candidate);
        return { ...op, handlerNodeId: candidate };
    });
}
function validateOperations(workflow, operations) {
    const errors = [];
    const nodeIds = new Set(workflow.nodes.map(n => n.id));
    if (!Array.isArray(operations) || operations.length === 0) {
        return { valid: false, errors: ["No operations were proposed."] };
    }
    for (const [i, op] of operations.entries()) {
        const label = `operation[${i}]`;
        if (!op.type || !ALLOWED_TYPES.has(op.type)) {
            errors.push(`${label}: unknown or missing operation type "${op.type}".`);
            continue;
        }
        if (!op.nodeId) {
            errors.push(`${label}: missing nodeId.`);
            continue;
        }
        if (!nodeIds.has(op.nodeId)) {
            errors.push(`${label}: nodeId "${op.nodeId}" does not exist in this workflow.`);
            continue;
        }
        switch (op.type) {
            case "ADD_RETRY":
                if (!op.maxRetries || op.maxRetries < 1 || op.maxRetries > 10) {
                    errors.push(`${label}: maxRetries must be between 1 and 10.`);
                }
                if (op.backoff && !["fixed", "exponential"].includes(op.backoff)) {
                    errors.push(`${label}: backoff must be "fixed" or "exponential".`);
                }
                break;
            case "ADD_TIMEOUT":
                if (!op.timeoutMs || op.timeoutMs < 100) {
                    errors.push(`${label}: timeoutMs must be a positive number (>= 100ms).`);
                }
                break;
            case "SET_CONFIG_FIELD":
                if (!op.field) {
                    errors.push(`${label}: SET_CONFIG_FIELD requires a field name.`);
                }
                if (op.value === undefined) {
                    errors.push(`${label}: SET_CONFIG_FIELD requires a value.`);
                }
                break;
            case "ADD_ERROR_HANDLER":
                if (!op.handlerNodeId || !op.handlerLabel) {
                    errors.push(`${label}: ADD_ERROR_HANDLER requires handlerNodeId and handlerLabel.`);
                }
                if (op.handlerNodeId && nodeIds.has(op.handlerNodeId)) {
                    errors.push(`${label}: handlerNodeId "${op.handlerNodeId}" collides with an existing node id.`);
                }
                break;
            case "FIX_DATA_MAPPING":
                if (!op.fromPath || !op.toPath) {
                    errors.push(`${label}: FIX_DATA_MAPPING requires fromPath and toPath.`);
                }
                break;
        }
    }
    return { valid: errors.length === 0, errors };
}
