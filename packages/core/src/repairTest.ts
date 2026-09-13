// ─────────────────────────────────────────────────────────────
// src/lib/services/repairTest.ts
// The "Test" step of the repair loop.
//
// IMPORTANT — v1 scope note: FlowLens does not yet have write access to
// n8n/Zapier/Make (lib/connections/*.ts are read-only), so this cannot
// actually re-run the live workflow. What it CAN do reliably is confirm the
// proposed fix structurally landed on the node it targeted (retry config
// present, timeout present, handler wired up, etc). That's enough to drive
// the retry loop and give the user a real signal, but it is a structural
// check, not a live execution result — the UI must say so.
//
// Upgrade path: once connections gain write/execute scopes, replace the body
// of testRepair() with a real "trigger execution -> poll status" call and
// keep the same FixTestResult contract so nothing else needs to change.
// ─────────────────────────────────────────────────────────────

import { NormalisedWorkFlow, RepairOperation, FixTestResult, FixTestCheck } from "./types";

export function testRepair(
  workflow: NormalisedWorkFlow,
  operations: RepairOperation[]
): FixTestResult {
  const checks: FixTestCheck[] = [];

  for (const op of operations) {
    const node = workflow.nodes.find(n => n.id === op.nodeId);

    switch (op.type) {
      case "ADD_RETRY":
        checks.push({
          label: `${op.nodeId}: retry configured`,
          passed: !!node?.config?.retry,
        });
        break;

      case "ADD_TIMEOUT":
        checks.push({
          label: `${op.nodeId}: timeout configured`,
          passed: node?.config?.timeoutMs === op.timeoutMs,
        });
        break;

      case "SET_CONFIG_FIELD":
        checks.push({
          label: `${op.nodeId}: ${op.field} updated`,
          passed: op.field ? node?.config?.[op.field] === op.value : false,
        });
        break;

      case "ADD_ERROR_HANDLER": {
        const handlerExists = workflow.nodes.some(n => n.id === op.handlerNodeId);
        const edgeExists = workflow.edges.some(
          e => e.source === op.nodeId && e.target === op.handlerNodeId
        );
        checks.push({
          label: `${op.nodeId}: error handler wired`,
          passed: handlerExists && edgeExists,
        });
        break;
      }

      case "FIX_DATA_MAPPING": {
        const mapping = node?.config?.mapping as Record<string, unknown> | undefined;
        checks.push({
          label: `${op.nodeId}: data mapping fixed`,
          passed: !!(op.toPath && mapping && mapping[op.toPath] === op.fromPath),
        });
        break;
      }
    }
  }

  const passed = checks.length > 0 && checks.every(c => c.passed);

  return {
    passed,
    message: passed
      ? "All proposed changes were applied and structurally verified. A live re-run is still recommended to fully confirm the fix."
      : "Some changes did not apply as expected — see failed checks below.",
    checks,
  };
}
