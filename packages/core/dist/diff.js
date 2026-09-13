"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffWorkflows = diffWorkflows;
function diffConfigs(before, after) {
    const changed = [];
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    keys.forEach(k => {
        if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
            changed.push({ field: k, before: before[k], after: after[k] });
        }
    });
    return changed;
}
function diffWorkflows(before, after) {
    const beforeMap = new Map(before.nodes.map(n => [n.id, n]));
    const afterMap = new Map(after.nodes.map(n => [n.id, n]));
    const diffs = [];
    beforeMap.forEach((bNode, id) => {
        const aNode = afterMap.get(id);
        if (!aNode) {
            diffs.push({ nodeId: id, nodeLabel: bNode.label, status: "removed" });
        }
        else {
            const changed = diffConfigs(bNode.config, aNode.config);
            diffs.push({
                nodeId: id,
                nodeLabel: bNode.label,
                status: changed.length > 0 ? "modified" : "unchanged",
                changedFields: changed.length > 0 ? changed : undefined,
            });
        }
    });
    afterMap.forEach((aNode, id) => {
        if (!beforeMap.has(id))
            diffs.push({ nodeId: id, nodeLabel: aNode.label, status: "added" });
    });
    const beforeEdges = new Set(before.edges.map(e => `${e.source}->${e.target}`));
    const afterEdges = new Set(after.edges.map(e => `${e.source}->${e.target}`));
    const edgesChanged = [...beforeEdges].some(e => !afterEdges.has(e)) ||
        [...afterEdges].some(e => !beforeEdges.has(e));
    return {
        nodes: diffs,
        edgesChanged,
        summary: {
            added: diffs.filter(n => n.status === "added").length,
            removed: diffs.filter(n => n.status === "removed").length,
            modified: diffs.filter(n => n.status === "modified").length,
        },
    };
}
