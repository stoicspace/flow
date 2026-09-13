// ─────────────────────────────────────────────────────────────
// src/app/api/ai/chat/route.ts
// POST /api/ai/chat — streaming AI assistant
// ─────────────────────────────────────────────────────────────

import { getAuthContext, AuthContext } from "@/lib/supabase/auth-helper";
import { createChatStream } from "@/lib/services/ai";
import { NextResponse } from "next/server";
import type { FlowNode, FlowEdge, NormalisedWorkFlow } from "@flowlens/core";
import { assertAiAllowed, getTeamAIProvider } from "@/lib/services/aiSettings";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";

// Builds a complete workflow-aware context string server-side instead of
// trusting only whatever the client passed in. Falls back gracefully if the
// workflow/snapshot can't be loaded so chat still works without it.
//
// Bounded on purpose: node configs and fix-attempt history can get large on
// complex workflows, so each section is capped rather than dumped raw, to
// keep prompts predictable in size and cost.
async function buildWorkflowContext(
  db: AuthContext["db"],
  teamId: string,
  workflowId?: string,
  clientContext = ""
): Promise<string> {
  const parts: string[] = [];
  if (clientContext) parts.push(clientContext);

  if (workflowId) {
    try {
      const storage = new SupabaseStorageAdapter(db);
      const workflow = await storage.getWorkflow(teamId, workflowId);

      if (workflow) {
        parts.push(
          `Workflow: ${workflow.name} (platform: ${workflow.platform}, status: ${workflow.status}).`
        );
      }

      const latest = await storage.getLatestSnapshot(teamId, workflowId);
      const normalised = latest?.normalised as NormalisedWorkFlow | undefined;

      if (normalised) {
        const { nodes = [], edges = [] } = normalised;

        parts.push(
          `Latest snapshot (${latest!.source}, ${new Date(latest!.created_at).toLocaleString()}): ` +
          `${nodes.length} nodes, ${edges.length} edges, execution_status=${latest!.execution_status || "unknown"}.`
        );

        if (latest!.error_message) {
          parts.push(`Most recent execution error: ${latest!.error_message}`);
        }

        // Node details WITH config — credentials are already stripped at
        // normalise time (see @flowlens/core's normalizer stripCredentials),
        // so it's safe to include as-is. Cap each config's JSON so one
        // huge node config can't blow out the whole prompt.
        const nodeLines = nodes.map((n: FlowNode) => {
          const configStr = n.config && Object.keys(n.config).length
            ? JSON.stringify(n.config).slice(0, 300)
            : "{}";
          return `- ${n.id} "${n.label}" (${n.type})${n.credential_ref ? ` [uses credential: ${n.credential_ref}]` : ""}: config=${configStr}`;
        });
        parts.push(`Nodes:\n${nodeLines.join("\n")}`);

        const edgeLines = edges.map((e: FlowEdge) => `${e.source} -> ${e.target}${e.label ? ` (${e.label})` : ""}`);
        if (edgeLines.length) {
          parts.push(`Edges:\n${edgeLines.join("\n")}`);
        }
      }

      // Recent Fix Workflow attempts — so the assistant can talk about a
      // fix that's already been proposed/applied instead of re-diagnosing
      // from scratch or contradicting what the Fix Workflow panel is showing.
      const fixAttempts = await storage.listFixAttempts(teamId, workflowId, 3);

      if (fixAttempts.length) {
        const attemptLines = fixAttempts.map((a) =>
          `- Attempt #${a.attempt_number} [${a.status}]: ${a.diagnosis || "no diagnosis"}. ` +
          `${(a.operations as unknown[])?.length || 0} operation(s). ` +
          `${a.test_result ? `Test: ${(a.test_result as { passed: boolean }).passed ? "passed" : "failed"} — ${(a.test_result as { message: string }).message}` : "Not yet tested."}`
        );
        parts.push(`Recent Fix Workflow attempts (most recent first):\n${attemptLines.join("\n")}`);
      }
    } catch (e) {
      console.error("buildWorkflowContext failed:", e);
    }
  }

  return parts.join("\n\n").slice(0, 12000);
}

// Simple in-memory rate limiter (upgrade to Upstash Redis in production)
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(userId: string, max = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (rateLimitMap.get(userId) || []).filter(t => now - t < windowMs);
  if (hits.length >= max) return true;
  rateLimitMap.set(userId, [...hits, now]);
  return false;
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { user, teamId, db } = ctx;

  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Wait a minute." },
      { status: 429 }
    );
  }

  const { messages, context = "", workflowId } = await request.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

  // Only require workflow_data_processing when this message actually pulls
  // in a specific workflow's data — a workflow-free chat message shouldn't
  // be blocked by that toggle, but the master ai_analysis_enabled switch
  // still applies either way.
  const gate = await assertAiAllowed(db, teamId, "chat", { includesWorkflowData: !!workflowId });
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  try {
    const fullContext = await buildWorkflowContext(db, teamId, workflowId, context);
    const provider = await getTeamAIProvider(db, teamId);
    return await createChatStream(provider, messages, fullContext);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Chat request failed." }, { status: 500 });
  }
}


