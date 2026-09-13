
// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/settings/page.tsx
// Figma: Profile Settings,left tab nav + right form
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Shield, Key, GitBranch, LogOut, Edit2, Copy, Check, Sparkles } from "lucide-react";

type SettingsTab = "General" | "AI & Privacy" | "Security" | "API Keys" | "Integrations";

interface AISettings {
  ai_analysis_enabled: boolean;
  workflow_data_processing: boolean;
  ai_documentation_enabled: boolean;
  automatic_reviews_enabled: boolean;
  privacy_mode: "standard" | "strict";
  processing_location: "cloud" | "local" | "self_hosted";
  ai_provider_endpoint?: string;
  ai_provider_shape?: "openai" | "anthropic";
  ai_provider_model?: string;
  has_api_key?: boolean;
  api_key_hint?: string;
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("General");
  const [profile, setProfile] = useState<{
  name: string;
  email: string;
  role: string;
  team_name: string;
  team_id: string;
} | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [savingAi, setSavingAi] = useState(false);
  const [providerForm, setProviderForm] = useState({ endpoint: "", shape: "openai" as "openai" | "anthropic", model: "", apiKey: "" });
  const [providerSaving, setProviderSaving] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [providerSaved, setProviderSaved] = useState(false);
  const router = useRouter();
  const supabase = createClient();

 useEffect(() => {
  async function load() {
    try {
      const res = await fetch("/api/profile");

      if (!res.ok) {
        console.error("Failed to load profile");
        return;
      }

      const { profile } = await res.json();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setProfile({
        ...profile,
        email: user?.email || "",
      });

      setName(profile.name);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadAiSettings() {
    try {
      const res = await fetch("/api/settings/ai").then(r => r.json());
      setAiSettings(res.settings);
      if (res.settings) {
        setProviderForm(prev => ({
          ...prev,
          endpoint: res.settings.ai_provider_endpoint || "",
          shape: res.settings.ai_provider_shape || "openai",
          model: res.settings.ai_provider_model || "",
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  load();
  loadAiSettings();
}, []);

  

  async function updateAiSetting<K extends keyof AISettings>(key: K, value: AISettings[K]) {
    if (!aiSettings) return;
    const previous = aiSettings;
    const next = { ...aiSettings, [key]: value };
    setAiSettings(next);
    setSavingAi(true);
    setAiError(null);
    try {
      const res = await fetch("/api/settings/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Save failed (${res.status})`);
    } catch (err) {
      console.error(err);
      setAiSettings(previous); // revert on failure
      setAiError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSavingAi(false);
    }
  }

  // Endpoint + shape + model + key must be validated and saved together —
  // a half-saved custom provider (e.g. endpoint without a working key)
  // should never silently become the active config.
  async function saveProviderConfig() {
    if (!providerForm.endpoint || !providerForm.model) {
      setProviderError("Endpoint and model are required.");
      return;
    }
    // A key is only required the first time — if one's already saved
    // (has_api_key) the person can update just the endpoint/model without
    // re-entering it, unless they're deliberately changing it.
    if (!aiSettings?.has_api_key && !providerForm.apiKey) {
      setProviderError("API key is required.");
      return;
    }

    setProviderSaving(true);
    setProviderError(null);
    setProviderSaved(false);
    try {
      const res = await fetch("/api/settings/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processing_location: "self_hosted",
          ai_provider_endpoint: providerForm.endpoint,
          ai_provider_shape: providerForm.shape,
          ai_provider_model: providerForm.model,
          ...(providerForm.apiKey ? { ai_provider_api_key: providerForm.apiKey } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save — check your endpoint, shape, and key.");
      setAiSettings(data.settings);
      setProviderForm(prev => ({ ...prev, apiKey: "" })); // never keep plaintext in state after save
      setProviderSaved(true);
      setTimeout(() => setProviderSaved(false), 2500);
    } catch (err: unknown) {
      setProviderError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setProviderSaving(false);
    }
  }

  async function handleSave() {
  setSaving(true);

  try {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
      }),
    });

    if (!res.ok) {
      throw new Error("Update failed");
    }

    const { profile: updated } = await res.json();

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            name: updated.name,
          }
        : prev
    );

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  } catch (err) {
    console.error(err);
  }

  setSaving(false);
}

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function copyId() {
    navigator.clipboard.writeText(profile?.team_name || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const tabs: { id: SettingsTab; icon: React.ReactNode }[] = [
    { id: "General",      icon: <User size={14} /> },
    { id: "AI & Privacy", icon: <Sparkles size={14} /> },
    { id: "Security",     icon: <Shield size={14} /> },
    { id: "API Keys",     icon: <Key size={14} /> },
    { id: "Integrations", icon: <GitBranch size={14} /> },
  ];

  return (
    <div className="p-8">
      {/* Profile hero */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-blue to-brand-orange flex items-center justify-center text-2xl font-bold text-text-primary">
              {(profile?.name || "?").slice(0, 1).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center border-2 border-surface">
              <Edit2 size={10} className="text-text-primary" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{profile?.name || "—"}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-xs bg-surface border border-border rounded-full px-2.5 py-1 text-text-muted">
                <Shield size={11} /> System Admin
              </span>
              <span className="flex items-center gap-1 text-xs bg-brand-blue/15 border border-brand-blue/25 rounded-full px-2.5 py-1 text-brand-orange">
                ● Pro Plan
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-sm text-text-muted bg-surface-2 border border-border rounded-lg px-4 py-2 hover:text-text-primary hover:border-gray-500 transition-colors">
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-medium bg-brand-blue text-text-primary rounded-lg px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left tab nav */}
        <div className="w-44 space-y-1 flex-shrink-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                tab === t.id
                  ? "bg-surface-2 text-text-primary border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {t.icon} {t.id}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1 max-w-2xl">
          {tab === "General" && (
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-text-muted mb-4">General Information</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Full Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand-blue/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Email Address</label>
                  <input
                    value={profile?.email || ""}
                    disabled
                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-muted outline-none cursor-not-allowed opacity-60"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Workspace Name</label>
                <div className="flex items-center gap-2">
                  <input
                    value={profile?.team_name || ""}
                    disabled
                    className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text-muted outline-none cursor-not-allowed"
                  />
                  <button
                    onClick={copyId}
                    className="flex items-center gap-1.5 text-sm bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-muted hover:text-text-primary hover:border-gray-500 transition-colors whitespace-nowrap"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    Copy ID
                  </button>
                </div>
              </div>

              {/* Danger */}
              <div className="mt-8 border-t border-border pt-6">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-status-error hover:opacity-80 transition-opacity"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}

          {tab === "AI & Privacy" && aiSettings && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-text-muted mb-1">AI & Privacy</h3>
                <p className="text-xs text-text-muted mb-4">
                  Control what FlowLens Copilot is allowed to do with your workflow data.
                  {savingAi && <span className="text-brand-orange"> Saving...</span>}
                </p>
              </div>

              <SettingToggle
                label="AI Analysis"
                description="Let FlowLens Copilot generate summaries, complexity scores, and review findings for your workflows."
                checked={aiSettings.ai_analysis_enabled}
                onChange={v => updateAiSetting("ai_analysis_enabled", v)}
              />
              <SettingToggle
                label="Workflow Data Processing"
                description="Send node names and structure (never credentials) to the AI for analysis. Turning this off disables most Copilot features."
                checked={aiSettings.workflow_data_processing}
                onChange={v => updateAiSetting("workflow_data_processing", v)}
              />
              <SettingToggle
                label="AI Documentation"
                description="Allow Copilot to auto-generate human-readable documentation for your workflows."
                checked={aiSettings.ai_documentation_enabled}
                onChange={v => updateAiSetting("ai_documentation_enabled", v)}
              />
              <SettingToggle
                label="Automatic Reviews"
                description="Run an AI review automatically whenever a new snapshot is imported or synced, instead of only on request."
                checked={aiSettings.automatic_reviews_enabled}
                onChange={v => updateAiSetting("automatic_reviews_enabled", v)}
              />

              <div className="border-t border-border pt-5">
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Privacy Mode</label>
                <p className="text-xs text-text-muted mb-2.5">
                  Strict mode redacts more aggressively before anything is sent for analysis.
                </p>
                <div className="flex gap-2">
                  {(["standard", "strict"] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => updateAiSetting("privacy_mode", mode)}
                      className={`text-xs font-medium rounded-full px-3.5 py-1.5 border transition-colors capitalize ${
                        aiSettings.privacy_mode === mode
                          ? "bg-brand-orange/15 text-brand-orange border-brand-orange/30"
                          : "bg-surface-2 text-text-muted border-border hover:border-gray-500"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Processing Location</label>
                <p className="text-xs text-text-muted mb-2.5">
                  Where workflow data is sent for AI analysis.
                </p>
                <div className="space-y-2">
                  {[
                    { id: "cloud" as const, label: "Cloud Processing", available: true, desc: "Analyzed via FlowLens's cloud AI service. Fastest, no setup required." },
                    { id: "self_hosted" as const, label: "Self-Hosted / BYOK", available: true, desc: "Bring your own endpoint, model, and API key — nothing goes through FlowLens's own AI service." },
                    { id: "local" as const, label: "Local Processing", available: false, desc: "Fully on-device inference, no network calls at all. Planned." },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => opt.available && updateAiSetting("processing_location", opt.id)}
                      disabled={!opt.available}
                      className={`w-full flex items-center justify-between text-left rounded-lg border px-4 py-3 transition-colors ${
                        aiSettings.processing_location === opt.id
                          ? "border-brand-orange/40 bg-brand-orange/5"
                          : "border-border bg-surface-2"
                      } ${opt.available ? "hover:border-gray-500" : "opacity-60 cursor-not-allowed"}`}
                    >
                      <div>
                        <p className="text-sm text-text-primary">{opt.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{opt.desc}</p>
                      </div>
                      {!opt.available && (
                        <span className="text-[10px] font-medium text-text-muted bg-surface border border-border rounded-full px-2 py-0.5 flex-shrink-0">
                          Planned
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {aiSettings.processing_location === "self_hosted" && (
                <div className="border-t border-border pt-5">
                  <label className="text-sm font-medium text-text-primary mb-1.5 block">Custom Endpoint</label>
                  <p className="text-xs text-text-muted mb-3">
                    Paste in the endpoint, shape, and model for your provider. See the{" "}
                    <a href="/docs/ai-endpoints" className="text-brand-orange hover:underline">
                      supported endpoints guide
                    </a>{" "}
                    for the exact values each provider needs.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Endpoint URL</label>
                      <input
                        type="text"
                        value={providerForm.endpoint}
                        onChange={e => setProviderForm(prev => ({ ...prev, endpoint: e.target.value }))}
                        placeholder="https://api.openai.com/v1/chat/completions"
                        className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-orange/50"
                      />
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-text-muted mb-1 block">Shape</label>
                        <div className="flex gap-2">
                          {(["openai", "anthropic"] as const).map(shape => (
                            <button
                              key={shape}
                              onClick={() => setProviderForm(prev => ({ ...prev, shape }))}
                              className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
                                providerForm.shape === shape
                                  ? "bg-brand-orange/15 text-brand-orange border-brand-orange/30"
                                  : "bg-surface-2 text-text-muted border-border hover:border-gray-500"
                              }`}
                            >
                              {shape === "openai" ? "OpenAI-compatible" : "Anthropic-compatible"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Model</label>
                      <input
                        type="text"
                        value={providerForm.model}
                        onChange={e => setProviderForm(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="gpt-4o-mini"
                        className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-orange/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-text-muted mb-1 block">
                        API Key {aiSettings.has_api_key && <span className="text-status-success">— {aiSettings.api_key_hint || "configured"}</span>}
                      </label>
                      <input
                        type="password"
                        value={providerForm.apiKey}
                        onChange={e => setProviderForm(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder={aiSettings.has_api_key ? "Leave blank to keep current key" : "sk-..."}
                        className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-orange/50"
                      />
                      <p className="text-[11px] text-text-muted mt-1">
                        Encrypted at rest. Never logged, never sent back to your browser once saved.
                      </p>
                    </div>

                    {providerError && (
                      <p className="text-xs text-status-error">{providerError}</p>
                    )}

                    <button
                      onClick={saveProviderConfig}
                      disabled={providerSaving}
                      className="text-xs font-medium bg-brand-orange text-white rounded-lg px-4 py-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
                    >
                      {providerSaving ? "Testing connection..." : providerSaved ? "Saved ✓" : "Test & Save"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "Security" && (
            <div className="bg-surface-2 border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Security</h3>
              <p className="text-sm text-text-muted">Password changes and MFA settings coming soon.</p>
            </div>
          )}

          {tab === "API Keys" && (
            <div className="bg-surface-2 border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">API Keys</h3>
              <p className="text-sm text-text-muted">API key management coming soon.</p>
            </div>
          )}

          {tab === "Integrations" && (
            <div className="bg-surface-2 border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Integrations</h3>
              <p className="text-sm text-text-muted">
                Connect n8n, Zapier, and Make from the{" "}
                <a href="/connections" className="text-brand-orange hover:underline">Connections page</a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



// Small reusable toggle row for the AI & Privacy tab.
function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 bg-surface-2 border border-border rounded-lg px-4 py-3.5">
      <div>
        <p className="text-sm text-text-primary">{label}</p>
        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
      </div>
     <button
  onClick={() => onChange(!checked)}
  className={`flex-shrink-0 w-10 h-6 rounded-full relative transition-colors ${
    checked ? "bg-brand-orange" : "bg-surface-3 border border-border"
  }`}
>
  <span
    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
      checked ? "translate-x-0.5" : "-translate-x-4"
    }`}
  />
</button>
    </div>
  );
}
