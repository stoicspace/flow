
export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
}

// --- ADD: execution type + fetcher ---

export interface N8nExecution {
  id: string;
  workflowId: string;
  status?: string; // "success" | "error" | "crashed" depending on n8n version
  finished: boolean;
  startedAt: string;
  stoppedAt: string | null;
  data?: {
    resultData?: {
      error?: { message?: string };
    };
  };
}


export async function testN8nConnection(
  baseUrl: string,
  apiKey: string
) {
  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/v1/workflows`,
    {
      headers: {
        "X-N8N-API-KEY": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Invalid API key or URL");
  }

  return true;
}

export async function getN8nWorkflows(
  baseUrl: string,
  apiKey: string
): Promise<N8nWorkflow[]> {
  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/v1/workflows`,
    {
      headers: {
        "X-N8N-API-KEY": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch workflows");
  }

  const json = await response.json();

return json.data || []; 
}
export async function getN8nExecutions(
  baseUrl: string,
  apiKey: string
): Promise<N8nExecution[]> {
  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/api/v1/executions?limit=50`,
    {
      headers: {
        "X-N8N-API-KEY": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch executions");
  }

  const json = await response.json();
  return json.data || [];
}

// src/lib/connections/n8n.ts
// EXTEND your existing file with this — keep testN8nConnection and
// getN8nWorkflows exactly as they are, just add the two pieces below.

// n8n's execution status field is inconsistent across versions — this
// normalizes it to a simple success/error/running so route handlers don't
// each need to know n8n's quirks.
export function normalizeN8nStatus(
  ex: N8nExecution
): "success" | "error" | "running" {
  if (ex.status === "success") return "success";
  if (ex.status === "error" || ex.status === "crashed") return "error";
  if (!ex.finished) return "running";
  return ex.data?.resultData?.error ? "error" : "success";
}

// --- your existing testN8nConnection() and getN8nWorkflows() stay as-is below ---
