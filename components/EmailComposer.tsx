"use client";

import { useState } from "react";
import { MarketingProfile, EmailDraft } from "@/lib/types";

interface EmailComposerProps {
  profile: MarketingProfile;
  drafts: EmailDraft[];
  onSaveDraft: (draft: EmailDraft) => void;
  onDeleteDraft: (id: string) => void;
}

function generateId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function EmailComposer({
  profile,
  drafts,
  onSaveDraft,
  onDeleteDraft,
}: EmailComposerProps) {
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const startNew = () => {
    setSelectedDraft(null);
    setSubject("");
    setBody("");
    setIsComposing(true);
  };

  const editDraft = (draft: EmailDraft) => {
    setSelectedDraft(draft);
    setSubject(draft.subject);
    setBody(draft.body);
    setIsComposing(true);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));

    const avatar = profile.targetAvatars[0];
    const tone = profile.emailPreferences.tone;

    const templates: Record<string, { subject: string; body: string }> = {
      casual: {
        subject: `Hey — quick update on ${profile.projectName} 👋`,
        body: `Hey!\n\nQuick update for you.\n\nWe've been working hard on ${profile.projectName} and I wanted to share what's new:\n\n→ ${profile.valueProposition || "Big improvements coming"}\n→ We listened to your feedback\n→ Something exciting is dropping next week\n\n${avatar ? `If you're a ${avatar.name} dealing with ${avatar.painPoints?.[0] || "the usual challenges"}, this one's for you.` : "Stay tuned."}\n\n${profile.emailPreferences.ctaStyle || "Check it out →"}\n\nCheers,\nThe ${profile.projectName} Team`,
      },
      formal: {
        subject: `${profile.projectName} — Important Update`,
        body: `Dear subscriber,\n\nWe are pleased to share the latest developments at ${profile.projectName}.\n\nKey Highlights:\n• ${profile.valueProposition || "Product enhancements"}\n• Improved user experience\n• New capabilities for your workflow\n\n${avatar ? `For ${avatar.name}s who are looking to ${avatar.goals?.[0] || "improve their results"}, these updates are designed with you in mind.` : ""}\n\nWe invite you to explore the latest version.\n\n${profile.emailPreferences.ctaStyle || "Learn More →"}\n\nBest regards,\nThe ${profile.projectName} Team`,
      },
      bold: {
        subject: `🔥 ${profile.projectName} just changed the game`,
        body: `Listen.\n\n${profile.projectName} just shipped something BIG.\n\nI'm talking:\n🔥 ${profile.valueProposition || "Complete game-changer"}\n🔥 Built for people who actually ship\n🔥 Zero BS, maximum output\n\n${avatar ? `If you're a ${avatar.name} tired of ${avatar.painPoints?.[0] || "wasting time"} — stop reading and go try this.` : "You need to see this."}\n\n👉 ${profile.emailPreferences.ctaStyle || "Try it NOW →"}\n\nLFG,\n${profile.projectName}`,
      },
    };

    const template = templates[tone] || templates.casual;
    setSubject(template.subject);
    setBody(template.body);
    setIsGenerating(false);
  };

  const handleSave = () => {
    const draft: EmailDraft = {
      id: selectedDraft?.id || generateId(),
      subject,
      body,
      status: "draft",
      createdAt: selectedDraft?.createdAt || new Date().toISOString(),
    };
    onSaveDraft(draft);
    setIsComposing(false);
    setSubject("");
    setBody("");
    setSelectedDraft(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 shrink-0">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            📧 Email Marketing
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tone: {profile.emailPreferences.tone} · Frequency: {profile.emailPreferences.frequency}
          </p>
        </div>
        <button
          onClick={startNew}
          className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
        >
          + New Email
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Draft list */}
        <div className="w-72 border-r border-border/20 overflow-y-auto p-4 space-y-2 shrink-0">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Drafts ({drafts.length})
          </p>
          {drafts.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-3xl block mb-2">📭</span>
              <p className="text-xs text-muted-foreground/50">
                No drafts yet
              </p>
            </div>
          ) : (
            drafts.map((draft, i) => (
              <button
                key={draft.id}
                onClick={() => editDraft(draft)}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer animate-slide-in-up stagger-${Math.min(
                  i + 1,
                  5
                )} ${
                  selectedDraft?.id === draft.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-surface/50 border border-transparent"
                }`}
              >
                <p className="text-[13px] font-medium text-foreground/85 leading-tight truncate">
                  {draft.subject || "Untitled"}
                </p>
                <p className="text-[11px] text-muted-foreground/50 mt-1 truncate">
                  {draft.body.slice(0, 60)}...
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="tag !text-[10px] !py-0.5"
                    style={{
                      borderColor:
                        draft.status === "ready"
                          ? "oklch(0.72 0.12 82 / 0.3)"
                          : "transparent",
                      color:
                        draft.status === "ready"
                          ? "oklch(0.72 0.12 82)"
                          : undefined,
                    }}
                  >
                    {draft.status}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Composer area */}
        <div className="flex-1 overflow-y-auto p-6">
          {isComposing ? (
            <div className="max-w-xl mx-auto space-y-5 animate-scale-in">
              <div className="flex items-center justify-between">
                <h3
                  className="text-base font-semibold"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {selectedDraft ? "Edit Email" : "Compose Email"}
                </h3>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-primary px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin-slow">✨</span> Writing...
                    </>
                  ) : (
                    <>✨ AI Write</>
                  )}
                </button>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Subject Line
                </label>
                <input
                  className="input-dark"
                  placeholder="Email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Body
                </label>
                <textarea
                  className="textarea-dark !min-h-[300px] font-mono text-[13px] leading-relaxed"
                  placeholder="Email body..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  {selectedDraft && (
                    <button
                      onClick={() => {
                        onDeleteDraft(selectedDraft.id);
                        setIsComposing(false);
                        setSelectedDraft(null);
                      }}
                      className="text-xs text-destructive/60 hover:text-destructive cursor-pointer transition-colors"
                    >
                      Delete draft
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsComposing(false);
                      setSelectedDraft(null);
                    }}
                    className="btn-ghost px-4 py-2 rounded-lg text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!subject.trim() || !body.trim()}
                    className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-30"
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center animate-fade-in">
                <span className="text-5xl block mb-4">📧</span>
                <h3
                  className="text-lg font-semibold text-foreground/70 mb-2"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  Email Marketing
                </h3>
                <p className="text-sm text-muted-foreground/50 max-w-xs mx-auto leading-relaxed">
                  Create targeted emails for your audience. Select a draft or start a new one.
                </p>
                <button
                  onClick={startNew}
                  className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer mt-4"
                >
                  + Compose New Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
