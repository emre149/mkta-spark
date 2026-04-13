"use client";

import { useState, useCallback } from "react";
import {
  MarketingProfile,
  TargetAvatar,
  ContentStyle,
  DEFAULT_CONTENT_STYLES,
  Platform,
} from "@/lib/types";

interface OnboardingFlowProps {
  onComplete: (profile: MarketingProfile) => void;
}

function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

const STEPS = [
  { title: "Your Project", emoji: "🚀" },
  { title: "Your Audience", emoji: "🎯" },
  { title: "Post Styles", emoji: "✍️" },
  { title: "Email Prefs", emoji: "📧" },
];

const PLATFORM_OPTIONS: { value: Platform; label: string; emoji: string }[] = [
  { value: "twitter", label: "X / Twitter", emoji: "𝕏" },
  { value: "linkedin", label: "LinkedIn", emoji: "in" },
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "newsletter", label: "Newsletter", emoji: "📧" },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);

  // Step 1: Project
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [valueProposition, setValueProposition] = useState("");

  // Step 2: Avatar
  const [avatars, setAvatars] = useState<TargetAvatar[]>([
    {
      id: generateId(),
      name: "",
      description: "",
      painPoints: [""],
      goals: [""],
      platforms: ["twitter"],
    },
  ]);

  // Step 3: Styles
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(
    new Set(["pas", "hook-value"])
  );
  const [customExample, setCustomExample] = useState("");

  // Step 4: Email
  const [emailTone, setEmailTone] = useState<"formal" | "casual" | "bold">("casual");
  const [emailFrequency, setEmailFrequency] = useState<"daily" | "weekly" | "biweekly">("weekly");
  const [ctaStyle, setCtaStyle] = useState("");

  const canProceed = useCallback(() => {
    switch (step) {
      case 0:
        return projectName.trim().length > 0 && projectDescription.trim().length > 0;
      case 1:
        return avatars.some((a) => a.name.trim().length > 0);
      case 2:
        return selectedStyles.size > 0;
      case 3:
        return true;
      default:
        return false;
    }
  }, [step, projectName, projectDescription, avatars, selectedStyles]);

  const handleFinish = () => {
    const chosenStyles = DEFAULT_CONTENT_STYLES.filter((s) =>
      selectedStyles.has(s.id)
    );

    if (customExample.trim()) {
      chosenStyles.push({
        id: generateId(),
        name: "Custom Style",
        description: "Your own post structure",
        structure: customExample,
        example: customExample,
        emoji: "✨",
      });
    }

    const profile: MarketingProfile = {
      projectName,
      projectDescription,
      valueProposition,
      targetAvatars: avatars.filter((a) => a.name.trim()),
      postStyles: chosenStyles,
      emailPreferences: {
        tone: emailTone,
        frequency: emailFrequency,
        ctaStyle: ctaStyle || "Learn more →",
      },
      onboardingCompleted: true,
    };

    onComplete(profile);
  };

  const updateAvatar = (index: number, field: keyof TargetAvatar, value: unknown) => {
    setAvatars((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const addAvatar = () => {
    setAvatars((prev) => [
      ...prev,
      {
        id: generateId(),
        name: "",
        description: "",
        painPoints: [""],
        goals: [""],
        platforms: ["twitter"],
      },
    ]);
  };

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePlatform = (avatarIdx: number, platform: Platform) => {
    setAvatars((prev) =>
      prev.map((a, i) => {
        if (i !== avatarIdx) return a;
        const has = a.platforms.includes(platform);
        return {
          ...a,
          platforms: has
            ? a.platforms.filter((p) => p !== platform)
            : [...a.platforms, platform],
        };
      })
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Mesh background */}
      <div className="mesh-bg" />

      {/* Logo / title */}
      <div className="mb-10 text-center animate-slide-in-up">
        <h1
          className="text-4xl font-bold mb-2 gradient-text"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Just Market It
        </h1>
        <p className="text-muted-foreground text-sm">
          Your AI Marketing Agent — Let&apos;s set you up.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10 animate-slide-in-up stagger-1 w-full max-w-lg px-4">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => i < step && setStep(i)}
              className={`step-dot ${i === step ? "active" : ""} ${
                i < step ? "completed" : ""
              }`}
            >
              {i < step ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{s.emoji}</span>
              )}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${i < step ? "completed" : ""}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="w-full max-w-2xl animate-scale-in" key={step}>
        <div className="glass-elevated rounded-2xl p-8">
          <h2
            className="text-2xl font-semibold mb-1"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {STEPS[step].emoji} {STEPS[step].title}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {step === 0 && "Tell us about your project so the AI knows your context."}
            {step === 1 && "Who are you trying to reach? Define your ideal audience."}
            {step === 2 && "Choose the post styles & frameworks you like. AI will use these."}
            {step === 3 && "Set your email marketing preferences."}
          </p>

          {/* STEP 0: Project */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Project Name
                </label>
                <input
                  className="input-dark"
                  placeholder="e.g. Just Market It, Nano Banana, JET..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  What does it do?
                </label>
                <textarea
                  className="textarea-dark"
                  placeholder="Describe your project in 2-3 sentences. What problem does it solve?"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Value Proposition (optional)
                </label>
                <input
                  className="input-dark"
                  placeholder="e.g. 10x your content output without hiring"
                  value={valueProposition}
                  onChange={(e) => setValueProposition(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 1: Avatar */}
          {step === 1 && (
            <div className="space-y-6">
              {avatars.map((avatar, idx) => (
                <div
                  key={avatar.id}
                  className="p-5 rounded-xl border border-border/50 bg-background/30 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Avatar {idx + 1}
                    </span>
                    {avatars.length > 1 && (
                      <button
                        onClick={() =>
                          setAvatars((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-xs text-destructive/70 hover:text-destructive cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    className="input-dark"
                    placeholder="Avatar name (e.g. Indie Hacker, SaaS Founder...)"
                    value={avatar.name}
                    onChange={(e) => updateAvatar(idx, "name", e.target.value)}
                  />
                  <textarea
                    className="textarea-dark"
                    placeholder="Describe this person: what do they do, what's their day like?"
                    value={avatar.description}
                    onChange={(e) =>
                      updateAvatar(idx, "description", e.target.value)
                    }
                    rows={2}
                  />
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Pain points (comma-separated)
                    </label>
                    <input
                      className="input-dark"
                      placeholder="e.g. no time, no audience, no ideas"
                      value={avatar.painPoints.join(", ")}
                      onChange={(e) =>
                        updateAvatar(
                          idx,
                          "painPoints",
                          e.target.value.split(",").map((s) => s.trim())
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      Platforms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORM_OPTIONS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => togglePlatform(idx, p.value)}
                          className={`tag cursor-pointer ${
                            avatar.platforms.includes(p.value) ? "active" : ""
                          }`}
                        >
                          {p.emoji} {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addAvatar}
                className="w-full py-3 rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-all cursor-pointer"
              >
                + Add another avatar
              </button>
            </div>
          )}

          {/* STEP 2: Post Styles */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEFAULT_CONTENT_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => toggleStyle(style.id)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedStyles.has(style.id)
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/30 bg-background/30 hover:border-border/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{style.emoji}</span>
                      <span className="text-sm font-semibold">{style.name}</span>
                      {selectedStyles.has(style.id) && (
                        <span className="ml-auto text-primary text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {style.description}
                    </p>
                    <div className="mt-2 p-2.5 rounded-lg bg-background/40 border border-border/20">
                      <p className="text-[11px] text-muted-foreground/70 font-mono whitespace-pre-line leading-relaxed">
                        {style.example}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Custom post structure (optional)
                </label>
                <textarea
                  className="textarea-dark"
                  placeholder="Paste an example of a post style you like..."
                  value={customExample}
                  onChange={(e) => setCustomExample(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Email Prefs */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Email Tone
                </label>
                <div className="flex gap-3">
                  {(["casual", "formal", "bold"] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setEmailTone(tone)}
                      className={`tag cursor-pointer text-sm px-4 py-2 ${
                        emailTone === tone ? "active" : ""
                      }`}
                    >
                      {tone === "casual" && "😊"} {tone === "formal" && "👔"}{" "}
                      {tone === "bold" && "🔥"} {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Newsletter Frequency
                </label>
                <div className="flex gap-3">
                  {(["daily", "weekly", "biweekly"] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setEmailFrequency(freq)}
                      className={`tag cursor-pointer text-sm px-4 py-2 ${
                        emailFrequency === freq ? "active" : ""
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Default CTA
                </label>
                <input
                  className="input-dark"
                  placeholder="e.g. Join the waitlist →, Try it free, Learn more..."
                  value={ctaStyle}
                  onChange={(e) => setCtaStyle(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={`btn-ghost px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer ${
              step === 0 ? "opacity-0 pointer-events-none" : ""
            }`}
          >
            ← Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="btn-primary px-8 py-2.5 rounded-xl text-sm font-semibold cursor-pointer animate-pulse-glow"
            >
              🚀 Launch My Agent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
