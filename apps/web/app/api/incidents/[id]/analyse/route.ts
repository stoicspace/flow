import { NextResponse, NextRequest } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { diffWorkflows } from "@flowlens/core";
import { analyseRootCause } from "@/lib/services/ai";
import { assertAiAllowed, getTeamAIProvider } from "@/lib/services/aiSettings";
import { SupabaseStorageAdapter } from "@flowlens/storage-supabase";
import type { NormalisedWorkFlow } from "@flowlens/core";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  const { id } = await params;
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const storage = new SupabaseStorageAdapter(db);
  const result = await storage.getIncidentWithSnapshots(teamId, id);

  if (!result) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }
  const { incident, snapshotBefore, snapshotAfter } = result;

  // Return cached result — never call AI twice for same incident
  if (incident.root_cause) {
    return NextResponse.json({
      cached: true,
      analysis: {
        problem: incident.problem,
        root_cause: incident.root_cause,
        confidence: incident.confidence,
        business_impact: incident.business_impact,
        impact_summary: incident.impact_summary,
        what_changed: incident.what_changed,
        suggested_fix: incident.suggested_fix,
        execution_evidence: incident.execution_evidence,
        recovery_steps: incident.recovery_steps,
      },
    });
  }

  if (!snapshotBefore || !snapshotAfter) {
    return NextResponse.json(
      { error: "Incident is missing one or both snapshots" },
      { status: 400 }
    );
  }

  // Gate only applies to a fresh AI call — the cached-result branch above
  // still returns previously-generated analysis even if AI is currently
  // disabled, since that's reading stored data, not making a new AI call.
  const gate = await assertAiAllowed(db, teamId, "analysis");
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const diff = diffWorkflows(
    snapshotBefore.normalised as NormalisedWorkFlow,
    snapshotAfter.normalised as NormalisedWorkFlow
  );

  const analysis = await analyseRootCause(await getTeamAIProvider(db, teamId), diff, incident.error_message ?? undefined);

  // Store result on incident. The four original columns always exist; the
  // new business-impact fields are best-effort until a migration adds them
  // (problem, business_impact, what_changed, execution_evidence, recovery_steps).
  try {
    await storage.updateIncident(teamId, id, {
      problem: analysis.problem,
      root_cause: analysis.root_cause,
      confidence: analysis.confidence,
      business_impact: analysis.business_impact,
      impact_summary: analysis.impact_summary,
      what_changed: analysis.what_changed,
      suggested_fix: analysis.suggested_fix,
      execution_evidence: analysis.execution_evidence,
      recovery_steps: analysis.recovery_steps,
    });
  } catch (e) {
    console.error("Storing extended incident analysis failed, retrying with legacy columns only:", e);
    await storage.updateIncident(teamId, id, {
      root_cause: analysis.root_cause,
      confidence: analysis.confidence,
      impact_summary: analysis.impact_summary,
      suggested_fix: analysis.suggested_fix,
    });
  }

  return NextResponse.json({ cached: false, analysis, diff });
}
