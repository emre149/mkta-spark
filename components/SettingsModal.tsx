"use client";

import { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
}: SettingsModalProps) {
  const [keyInput, setKeyInput] = useState("");
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testError, setTestError] = useState("");

  if (!isOpen) return null;

  const maskedKey = apiKey
    ? `••••••••••${apiKey.slice(-4)}`
    : "";

  const handleSave = () => {
    if (keyInput.trim()) {
      onSaveKey(keyInput.trim());
      setKeyInput("");
      setTestStatus("idle");
    }
  };

  const handleTest = async () => {
    const key = keyInput.trim() || apiKey;
    if (!key) return;

    setTestStatus("testing");
    setTestError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 10,
          messages: [{ role: "user", content: "ping" }],
        }),
      });
      if (res.ok) {
        setTestStatus("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setTestError(data?.error?.message || `HTTP ${res.status}`);
        setTestStatus("error");
      }
    } catch (e) {
      setTestError("Network error");
      setTestStatus("error");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl p-5 w-[400px] space-y-4 animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3
            className="text-lg font-semibold text-foreground"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            ⚙️ Settings
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <label className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider">
            Claude API Key
          </label>

          {apiKey && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-mono">
                {maskedKey}
              </span>
              <span className="text-[10px] text-copper font-medium">
                Connected ✓
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="password"
              placeholder={apiKey ? "Enter new key..." : "sk-ant-..."}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="flex-1 bg-surface border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!keyInput.trim()}
              className="px-4 py-1.5 rounded-lg text-[11px] font-semibold bg-copper text-copper-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleTest}
              disabled={!keyInput.trim() && !apiKey}
              className="px-4 py-1.5 rounded-lg text-[11px] font-semibold bg-surface-elevated text-foreground border border-border disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              Test
            </button>

            {testStatus === "testing" && (
              <div className="flex items-center gap-1 ml-2">
                <div className="thinking-dot" />
                <div className="thinking-dot" />
                <div className="thinking-dot" />
              </div>
            )}
            {testStatus === "success" && (
              <span className="text-[11px] text-copper font-medium ml-2 self-center">
                Connected ✓
              </span>
            )}
            {testStatus === "error" && (
              <span className="text-[11px] text-destructive ml-2 self-center">
                {testError}
              </span>
            )}
          </div>

          {!apiKey && (
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              Your key is stored locally in your browser. It is never sent
              anywhere except directly to the Anthropic API.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
