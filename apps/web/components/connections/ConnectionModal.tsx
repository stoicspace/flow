// components/connections/ConnectionModal.tsx
"use client";

import { useState } from "react";

interface Props {
  platform: string;
  open: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export default function ConnectionModal({
  platform,
  open,
  onClose,
  onConnected,
}: Props) {
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [makeTeamId, setMakeTeamId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const isZapier = platform === "zapier";
  const isMake = platform === "make";

  async function handleConnect() {
    setSubmitting(true);
    setError("");
    if(!name) return ;
    try {
      const res = await fetch("/api/connections/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          name: name || platform,
          baseUrl: isZapier ? undefined : baseUrl,
          apiKey: isZapier ? undefined : apiKey,
          makeTeamId: isMake ? makeTeamId : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Connection failed");
        return;
      }

      if (isZapier && json.webhookUrl) {
        setWebhookUrl(json.webhookUrl);
        return;
      }

      onConnected();
      handleClose();
    } catch {
      setError("Could not reach server.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setName("");
    setBaseUrl("");
    setApiKey("");
    setMakeTeamId("");
    setWebhookUrl("");
    setError("");
    setCopied(false);
    onClose();
  }

  function copyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-auto max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-2xl">

        {/* Header */}
        <div className="border-b border-border p-6">
          <h2 className="text-xl font-semibold capitalize text-text-primary">
            Connect {platform}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar">

          {isZapier && webhookUrl ? (
            <div className="space-y-6">

              <div className="rounded-xl border border-status-success/20 bg-status-success/10 p-4">
                <h3 className="font-semibold text-status-success">
                  Zapier Connected Successfully
                </h3>

                <p className="mt-2 text-sm text-text-muted">
                  Copy the webhook URL below and paste it into your Zap.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  FlowLens Webhook URL
                </label>

                <div className="flex gap-2">
                  <input
                    readOnly
                    value={webhookUrl}
                    className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary"
                  />

                  <button
                    onClick={copyWebhookUrl}
                    className="rounded-lg border border-border px-4 hover:border-brand-orange text-text-primary"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4">
                <h4 className="mb-3 font-medium text-text-primary">
                  Setup Instructions
                </h4>

                <ol className="list-decimal space-y-2 pl-5 text-sm text-text-muted">
                  <li>Create a new Zap.</li>
                  <li>Add your Trigger.</li>
                  <li>Add your Actions.</li>
                  <li>Add <strong>Webhooks by Zapier</strong> as the final action.</li>
                  <li>Select <strong>POST</strong>.</li>
                  <li>Paste the webhook URL above.</li>
                  <li>Choose <strong>JSON</strong> body.</li>
                  <li>Map the workflow fields.</li>
                  <li>Publish your Zap.</li>
                </ol>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4 text-text-primary">
                <h4 className="mb-3 font-medium ">
                  Example JSON
                </h4>

                <pre className="overflow-x-auto rounded-lg bg-surface-3 p-3 text-xs">
{`{
  "workflow_name": "Order Processing",
  "status": "success",
  "run_id": "123456",
  "duration_ms": 450,
  "error": "",
  "timestamp": "2026-08-04T18:00:00Z"
}`}
                </pre>
              </div>

            </div>
          ) : (
            <div className="space-y-4">

              <input
                placeholder="Connection Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-text-primary rounded-lg border border-border bg-surface px-3 py-2"
              />

              {!isZapier && (
                <>
                  <input
                    placeholder={
                      isMake
                        ? "Zone URL (https://eu1.make.com)"
                        : "Base URL"
                    }
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary"
                  />

                  <input
                    placeholder={isMake ? "API Token" : "API Key"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary"
                  />
                </>
              )}

              {isMake && (
                <input
                  placeholder="Organization ID"
                  value={makeTeamId}
                  onChange={(e) => setMakeTeamId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary" 
                />
              )}

              {isZapier && (
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-sm text-text-muted">
                    No API keys are required.
                    <br />
                    Click <strong>Connect</strong> to generate a secure webhook URL.
                  </p>
                </div>
              )}

              {error && (
                <p className="text-sm text-status-error">
                  {error}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border p-6">

          {isZapier && webhookUrl ? (
            <button
              onClick={() => {
                onConnected();
                handleClose();
              }}
              className="rounded-lg bg-brand-orange px-5 py-2 text-white"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                className="rounded-lg border border-border px-5 py-2 text-text-primary"
              >
                Cancel
              </button>

              <button
                onClick={handleConnect}
                disabled={submitting}
                className="rounded-lg bg-brand-orange px-5 py-2 text-white disabled:opacity-50"
              >
                {submitting ? "Connecting..." : "Connect"}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}