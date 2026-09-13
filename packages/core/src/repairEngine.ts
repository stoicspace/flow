// ─────────────────────────────────────────────────────────────
// src/lib/services/repairEngine.ts
// The "Apply" step: turns validated operations into a new workflow.
// Never mutates the input — always returns a deep-cloned copy, so the
// original snapshot stays untouched (Original -> Create Snapshot ->
// AI proposes fix -> Validate -> Create modified version -> Test).
// ─────────────────────────────────────────────────────────────

import { NormalisedWorkFlow, RepairOperation, FlowNode } from "./types";

export function applyOperations(
  workflow: NormalisedWorkFlow,
  operations: RepairOperation[]
): NormalisedWorkFlow {
  const result: NormalisedWorkFlow = JSON.parse(JSON.stringify(workflow));

  for (const op of operations) {
    const node = result.nodes.find(n => n.id === op.nodeId);
    if (!node) continue; // already validated upstream — skip defensively

    switch (op.type) {
      case "ADD_RETRY":
        node.config = {
          ...node.config,
          retry: {
            maxRetries: op.maxRetries ?? 3,
            backoff: op.backoff ?? "exponential",
          },
        };
        break;

      case "ADD_TIMEOUT":
        node.config = {
          ...node.config,
          timeoutMs: op.timeoutMs,
        };
        break;

      case "SET_CONFIG_FIELD":
        if (op.field) {
          node.config = { ...node.config, [op.field]: op.value };
        }
        break;

      case "ADD_ERROR_HANDLER": {
        if (!op.handlerNodeId) break;
        const handlerNode: FlowNode = {
          id: op.handlerNodeId,
          type: op.handlerType || "errorHandler",
          label: op.handlerLabel || "Error Handler",
          config: { source_node: node.id },
        };
        result.nodes.push(handlerNode);
        result.edges.push({
          id: `${node.id}->${handlerNode.id}`,
          source: node.id,
          target: handlerNode.id,
          label: "on error",
        });
        break;
      }

      case "FIX_DATA_MAPPING":
        if (op.fromPath && op.toPath) {
          node.config = {
            ...node.config,
            mapping: {
              ...(node.config?.mapping as Record<string, unknown> | undefined),
              [op.toPath]: op.fromPath,
            },
          };
        }
        break;
    }
  }

  return result;
}
