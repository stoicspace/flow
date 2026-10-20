"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectPlatform = detectPlatform;
exports.normalise = normalise;
function stripCredentials(config) {
    const safe = { ...config };
    ["apiKey", "token", "password", "secret", "credentials", "accessToken"]
        .forEach(k => { if (k in safe)
        safe[k] = "[REDACTED]"; });
    return safe;
}
function autoLayout(index) {
    const cols = 4;
    return {
        x: (index % cols) * 220,
        y: Math.floor(index / cols) * 140,
    };
}
// ─────────────────────────────────────────────────────────────
// n8n
// ─────────────────────────────────────────────────────────────
function normaliseN8n(raw) {
    if (!raw.nodes || !Array.isArray(raw.nodes)) {
        throw new Error("Invalid n8n workflow: missing nodes array");
    }
    if (!raw.connections || typeof raw.connections !== "object") {
        throw new Error("Invalid n8n workflow: missing connections object");
    }
    const rawNodes = raw.nodes || [];
    const nodes = rawNodes.map((n, index) => ({
        id: n.id,
        type: n.type,
        label: n.name || n.type,
        config: stripCredentials(n.parameters || {}),
        credential_ref: n.credentials
            ? Object.keys(n.credentials)[0]
            : undefined,
        position: n.position
            ? { x: n.position[0], y: n.position[1] }
            : autoLayout(index),
    }));
    const connections = raw.connections || {};
    const edges = [];
    Object.entries(connections).forEach(([sourceLabel, targets]) => {
        const sourceNode = nodes.find(n => n.label === sourceLabel);
        if (!sourceNode)
            return;
        (targets.main || []).forEach((outputs) => {
            outputs.forEach((conn) => {
                const targetNode = nodes.find(n => n.label === conn.node);
                if (targetNode)
                    edges.push({
                        id: `${sourceNode.id}->${targetNode.id}`,
                        source: sourceNode.id,
                        target: targetNode.id,
                    });
            });
        });
        (targets.ai_tool || []).forEach((outputs) => {
            outputs.forEach((conn) => {
                const targetNode = nodes.find(n => n.label === conn.node);
                if (targetNode)
                    edges.push({
                        id: `${sourceNode.id}-ai->${targetNode.id}`,
                        source: sourceNode.id,
                        target: targetNode.id,
                        label: "ai_tool",
                    });
            });
        });
    });
    return {
        nodes,
        edges,
        meta: {
            platform: "n8n",
            name: raw.name || "Unnamed",
            version: raw.versionId,
        },
    };
}
// ─────────────────────────────────────────────────────────────
// Zapier
// Zapier export format:
// {
//   title: "My Zap",
//   steps: [
//     {
//       id: "1",
//       type_of: "read" | "write" | "filter" | "search",
//       app: { name: "Gmail", image: "..." },
//       action_description: "Trigger: New Email",
//       params: { label: "INBOX", ... }
//     },
//     ...
//   ]
// }
// Zapier steps are sequential — each step connects to the next one.
// No explicit edge data; connections are implicit by order.
// ─────────────────────────────────────────────────────────────
function normaliseZapier(raw) {
    if (!Array.isArray(raw.steps)) {
        throw new Error("Invalid Zapier workflow: missing steps array");
    }
    if (!raw.title) {
        throw new Error("Invalid Zapier workflow: missing title");
    }
    const rawSteps = raw.steps;
    const nodes = rawSteps.map((step, index) => {
        const appName = step.app?.name || step.app_name || "Unknown App";
        const actionDesc = step.action_description || step.description || appName;
        const stepType = step.type_of || step.type || "action";
        return {
            id: step.id ? String(step.id) : `step-${index}`,
            type: `zapier.${stepType}`,
            label: actionDesc,
            config: stripCredentials(step.params || step.input || {}),
            credential_ref: step.authentication
                ? `zapier_auth_${appName.toLowerCase().replace(/\s+/g, "_")}`
                : step.app?.slug
                    ? `zapier_${step.app.slug}`
                    : undefined,
            position: autoLayout(index),
        };
    });
    // Zapier steps are sequential — connect each step to the next
    const edges = nodes.slice(0, -1).map((node, i) => ({
        id: `${node.id}->${nodes[i + 1].id}`,
        source: node.id,
        target: nodes[i + 1].id,
    }));
    // Handle filter steps — they branch (pass/fail paths)
    // Zapier filters break the chain; mark the edge with a label
    rawSteps.forEach((step, i) => {
        if ((step.type_of === "filter" || step.type === "filter") && nodes[i + 1]) {
            // Replace the plain edge with a labelled one
            const edgeIndex = edges.findIndex(e => e.source === nodes[i].id);
            if (edgeIndex !== -1) {
                edges[edgeIndex] = {
                    ...edges[edgeIndex],
                    label: "passes filter",
                };
            }
        }
    });
    return {
        nodes,
        edges,
        meta: {
            platform: "zapier",
            name: raw.title || "Unnamed Zap",
            version: raw.version ? String(raw.version) : undefined,
        },
    };
}
// ─────────────────────────────────────────────────────────────
// Make (formerly Integromat)
// Make export format:
// {
//   name: "My Scenario",
//   metadata: { version: 1, ... },
//   flow: [
//     {
//       id: 1,
//       module: "gmail:TriggerNewEmail",
//       version: 1,
//       parameters: { folder: "INBOX" },
//       mapper: { ... },
//       routes: [  // optional — for routers/filters
//         { flow: [ ... ] }
//       ]
//     },
//     ...
//   ],
//   connections: [  // optional explicit connections
//     { from: 1, to: 2 }
//   ]
// }
// Make uses numeric IDs. Modules are "app:ActionName" strings.
// ─────────────────────────────────────────────────────────────
function normaliseMake(raw) {
    if (!Array.isArray(raw.flow)) {
        throw new Error("Invalid Make workflow: missing flow array");
    }
    if (!raw.metadata) {
        throw new Error("Invalid Make workflow: missing metadata");
    }
    // Make can have nested flows (routers) — flatten them
    function flattenFlow(flow, parentId) {
        const result = [];
        flow.forEach(module => {
            result.push({ ...module, _parentId: parentId });
            // Flatten route branches
            if (module.routes && Array.isArray(module.routes)) {
                module.routes.forEach((route) => {
                    if (route.flow && Array.isArray(route.flow)) {
                        result.push(...flattenFlow(route.flow, String(module.id)));
                    }
                });
            }
        });
        return result;
    }
    const flatFlow = flattenFlow(raw.flow);
    const nodes = flatFlow.map((module, index) => {
        const moduleId = String(module.id ?? `module-${index}`);
        // Make module format: "app:ActionName" e.g. "gmail:TriggerNewEmail"
        const moduleParts = (module.module || "").split(":");
        const appName = moduleParts[0] || "unknown";
        const actionName = moduleParts[1] || module.module || "Unknown";
        // Humanise action name: "TriggerNewEmail" → "Trigger New Email"
        const humanLabel = actionName.replace(/([A-Z])/g, " $1").trim();
        return {
            id: moduleId,
            type: `make.${appName}`,
            label: module.name || humanLabel || appName,
            config: stripCredentials({
                ...(module.parameters || {}),
                ...(module.mapper || {}),
            }),
            credential_ref: module.connection
                ? `make_${appName}_${module.connection.id || "conn"}`
                : undefined,
            position: module.metadata?.designer
                ? { x: module.metadata.designer.x, y: module.metadata.designer.y }
                : autoLayout(index),
        };
    });
    const edges = [];
    // Use explicit connections if provided
    if (Array.isArray(raw.connections)) {
        raw.connections.forEach((conn) => {
            edges.push({
                id: `${conn.from}->${conn.to}`,
                source: String(conn.from),
                target: String(conn.to),
            });
        });
    }
    else {
        // Fall back to sequential connections from flattened flow
        flatFlow.forEach((module, i) => {
            if (i === 0)
                return;
            const prev = flatFlow[i - 1];
            const sourceId = String(prev.id ?? `module-${i - 1}`);
            const targetId = String(module.id ?? `module-${i}`);
            // If this module has a parent (came from a route branch), connect from parent
            const actualSource = module._parentId || sourceId;
            edges.push({
                id: `${actualSource}->${targetId}`,
                source: actualSource,
                target: targetId,
                label: module._parentId ? "route" : undefined,
            });
        });
    }
    return {
        nodes,
        edges,
        meta: {
            platform: "make",
            name: raw.name || "Unnamed Scenario",
            version: raw.metadata?.version
                ? String(raw.metadata.version)
                : undefined,
        },
    };
}
// ─────────────────────────────────────────────────────────────
// Platform detection
// ─────────────────────────────────────────────────────────────
function detectPlatform(raw) {
    if (Array.isArray(raw.nodes) && raw.connections)
        return "n8n";
    if (Array.isArray(raw.steps) && raw.title)
        return "zapier";
    if (Array.isArray(raw.flow) && raw.metadata)
        return "make";
    return "unknown";
}
// ─────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────
function normalise(platform, raw) {
    switch (platform) {
        case "n8n": return normaliseN8n(raw);
        case "zapier": return normaliseZapier(raw);
        case "make": return normaliseMake(raw);
        default: throw new Error(`Unsupported platform: ${platform}`);
    }
}
