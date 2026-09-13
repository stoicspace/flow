"use client";

import { useState, useRef } from "react";
import {
  User,
  Mail,
  Shield,
  Key,
  Share2,
  Pencil,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";

interface ProfileSettingsProps {
  displayName: string;
  email: string;
  role: string;
  teamName: string;
  plan?: string;
  avatarUrl?: string;
  workspaceId?: string;
}

type TabId = "general" | "security" | "api-keys" | "integrations";

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "general", label: "General", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "integrations", label: "Integrations", icon: Share2 },
];

export default function ProfileSettings({
  displayName,
  email,
  role,
  teamName,
  plan = "Pro Plan",
  avatarUrl,
  workspaceId = "ws_flowlens_core",
}: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  const [name, setName] = useState(displayName);
  const [workspaceName, setWorkspaceName] = useState(teamName);
  const [avatar, setAvatar] = useState(avatarUrl);

  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function markDirty() {
    if (!isDirty) setIsDirty(true);
  }

  function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
    markDirty();
  }

  function handleDiscard() {
    setName(displayName);
    setWorkspaceName(teamName);
    setAvatar(avatarUrl);
    setIsDirty(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      const requests: Promise<Response>[] = [];

      if (name.trim() && name !== displayName) {
        requests.push(
          fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim() }),
          })
        );
      }

      if (workspaceName.trim() && workspaceName !== teamName) {
        requests.push(
          fetch("/api/team", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: workspaceName.trim() }),
          })
        );
      }

      const results = await Promise.all(requests);
      for (const res of results) {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to save changes.");
        }
      }

      // Note: avatar changes are NOT persisted — there's no file-storage
      // backend wired up in this codebase yet (would need Supabase Storage
      // or similar). The preview above is local-only and resets on reload.
      setIsDirty(false);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  function handleCopyId() {
    navigator.clipboard?.writeText(workspaceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="max-w-5xl">
      {/* Header: avatar, name, badges, save/discard */}
      <div className="flex items-start justify-between gap-6 mb-3">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className="w-16 h-16 rounded-xl object-cover border border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-xl font-bold text-text-primary">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-brand-blue flex items-center justify-center border-2 border-surface hover:opacity-90 transition-opacity"
              aria-label="Change avatar"
            >
              <Pencil size={12} className="text-text-primary" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarPick}
              className="hidden"
            />
          </div>

          <div>
            <p className="text-lg font-semibold text-text-primary mb-1.5">
              {name}
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-surface-2 border border-border text-text-muted px-2.5 py-1 rounded-full capitalize">
                <ShieldCheck size={12} />
                {role}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand-blue/15 text-text-primary px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                {plan}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!isDirty || saving}
            className="text-sm font-medium text-text-primary border border-border rounded-lg px-4 py-2 hover:bg-surface-2 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="text-sm font-medium text-text-primary bg-brand-blue rounded-lg px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {saveError && (
        <p className="text-xs text-status-error mb-5">{saveError}</p>
      )}

      <div className="flex gap-8">
        {/* Sub-nav */}
        <nav className="w-48 shrink-0 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 text-sm rounded-lg px-3 py-2.5 transition-colors ${
                  active
                    ? "bg-brand-blue/15 text-text-primary font-medium"
                    : "text-text-muted hover:bg-surface-2 hover:text-text-primary"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Panel */}
        <div className="flex-1 min-w-0">
          {activeTab === "general" && (
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-5">
                General Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">
                    Full Name
                  </label>
                  <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5 focus-within:border-brand-blue transition-colors">
                    <User size={14} className="text-text-muted shrink-0" />
                    <input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        markDirty();
                      }}
                      className="flex-1 min-w-0 bg-transparent text-sm text-text-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5 opacity-60">
                    <Mail size={14} className="text-text-muted shrink-0" />
                    <span className="text-sm text-text-muted truncate">
                      {email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label className="text-xs text-text-muted mb-1.5 block">
                  Workspace Name
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5 focus-within:border-brand-blue transition-colors">
                    <input
                      value={workspaceName}
                      onChange={(e) => {
                        setWorkspaceName(e.target.value);
                        markDirty();
                      }}
                      className="flex-1 min-w-0 bg-transparent text-sm text-text-primary outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 text-sm text-text-primary border border-border rounded-lg px-3.5 py-2.5 hover:bg-surface-2 transition-colors shrink-0"
                  >
                    {copied ? (
                      <Check size={14} className="text-text-primary" />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copied ? "Copied" : "Copy ID"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="text-sm text-text-muted">
              Security settings go here.
            </div>
          )}
          {activeTab === "api-keys" && (
            <div className="text-sm text-text-muted">
              API key management goes here.
            </div>
          )}
          {activeTab === "integrations" && (
            <div className="text-sm text-text-muted">
              Connected integrations go here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}