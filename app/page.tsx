"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MarketingProfile,
  SocialPost,
  WeeklyTopic,
  EmailDraft,
  BrandKit,
  ContentStyle,
  AppView,
} from "@/lib/types";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { ContentCalendar } from "@/components/ContentCalendar";
import { WeeklyTopics } from "@/components/WeeklyTopics";
import { ContentStyles } from "@/components/ContentStyles";
import { PostComposer } from "@/components/PostComposer";
import { EmailComposer } from "@/components/EmailComposer";
import { BrandingKit } from "@/components/BrandingKit";

// ── Utils ────────────────────────────────────────────────

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function dateToKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function getWeekDates(ref: Date): Date[] {
  const d = new Date(ref);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function getWeekKey(ref: Date): string {
  const d = new Date(ref);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ── Main Page ────────────────────────────────────────────

export default function MarketingAgentPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [view, setView] = useState<AppView>("dashboard");

  // Data
  const [profile, setProfile] = useState<MarketingProfile | null>(null);
  const [posts, setPosts] = useState<Record<string, SocialPost[]>>({});
  const [topics, setTopics] = useState<WeeklyTopic[]>([]);
  const [emailDrafts, setEmailDrafts] = useState<EmailDraft[]>([]);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  // UI state
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDateKey, setComposerDateKey] = useState<string>("");
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  // Week dates
  const weekDates = useMemo(() => {
    const ref = new Date();
    ref.setDate(ref.getDate() + weekOffset * 7);
    return getWeekDates(ref);
  }, [weekOffset]);

  const weekKey = useMemo(() => {
    const ref = new Date();
    ref.setDate(ref.getDate() + weekOffset * 7);
    return getWeekKey(ref);
  }, [weekOffset]);

  const weekTitle = useMemo(() => {
    const first = weekDates[0];
    const last = weekDates[6];
    const fMonth = MONTH_NAMES[first.getMonth()];
    const lMonth = MONTH_NAMES[last.getMonth()];
    if (fMonth === lMonth) {
      return `${fMonth} ${first.getDate()} — ${last.getDate()}, ${last.getFullYear()}`;
    }
    return `${fMonth} ${first.getDate()} — ${lMonth} ${last.getDate()}, ${last.getFullYear()}`;
  }, [weekDates]);

  // ── Hydrate ─────────────────────────────────────────

  useEffect(() => {
    const storedProfile = loadFromStorage<MarketingProfile | null>("ma_profile", null);
    const storedPosts = loadFromStorage<Record<string, SocialPost[]>>("ma_posts", {});
    const storedTopics = loadFromStorage<WeeklyTopic[]>("ma_topics", []);
    const storedEmails = loadFromStorage<EmailDraft[]>("ma_emails", []);
    const storedBrandKit = loadFromStorage<BrandKit | null>("ma_brand_kit", null);

    setProfile(storedProfile);
    setPosts(storedPosts);
    setTopics(storedTopics);
    setEmailDrafts(storedEmails);
    setBrandKit(storedBrandKit);

    if (!storedProfile || !storedProfile.onboardingCompleted) {
      setView("onboarding");
    }

    setIsHydrated(true);
  }, []);

  // ── Persist ─────────────────────────────────────────

  useEffect(() => {
    if (!isHydrated) return;
    if (profile) saveToStorage("ma_profile", profile);
  }, [profile, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage("ma_posts", posts);
  }, [posts, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage("ma_topics", topics);
  }, [topics, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage("ma_emails", emailDrafts);
  }, [emailDrafts, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (brandKit) saveToStorage("ma_brand_kit", brandKit);
  }, [brandKit, isHydrated]);

  // ── Onboarding ──────────────────────────────────────

  const handleOnboardingComplete = useCallback((p: MarketingProfile) => {
    setProfile(p);
    setView("dashboard");
  }, []);

  // ── Post actions ────────────────────────────────────

  const handleSavePost = useCallback((post: SocialPost) => {
    setPosts((prev) => {
      const dayPosts = [...(prev[post.scheduledDate] || [])];
      const existingIdx = dayPosts.findIndex((p) => p.id === post.id);
      if (existingIdx >= 0) {
        dayPosts[existingIdx] = post;
      } else {
        dayPosts.push(post);
      }
      return { ...prev, [post.scheduledDate]: dayPosts };
    });
    setComposerOpen(false);
    setEditingPost(null);
  }, []);

  const handleDeletePost = useCallback((id: string) => {
    setPosts((prev) => {
      const next = { ...prev };
      for (const [key, dayPosts] of Object.entries(next)) {
        next[key] = dayPosts.filter((p) => p.id !== id);
      }
      return next;
    });
    setComposerOpen(false);
    setEditingPost(null);
  }, []);

  const handleAddPost = useCallback((dateKey: string) => {
    setComposerDateKey(dateKey);
    setEditingPost(null);
    setComposerOpen(true);
  }, []);

  const handleSelectPost = useCallback((post: SocialPost) => {
    setEditingPost(post);
    setComposerDateKey(post.scheduledDate);
    setComposerOpen(true);
  }, []);

  // ── Topic actions ───────────────────────────────────

  const handleAddTopic = useCallback(
    (topic: string, notes: string) => {
      setTopics((prev) => [
        ...prev,
        { id: generateId(), topic, notes, weekKey },
      ]);
    },
    [weekKey]
  );

  const handleRemoveTopic = useCallback((id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Email actions ───────────────────────────────────

  const handleSaveEmailDraft = useCallback((draft: EmailDraft) => {
    setEmailDrafts((prev) => {
      const existingIdx = prev.findIndex((d) => d.id === draft.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = draft;
        return next;
      }
      return [...prev, draft];
    });
  }, []);

  const handleDeleteEmailDraft = useCallback((id: string) => {
    setEmailDrafts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // ── Style selection ─────────────────────────────────

  const handleSelectStyle = useCallback((style: ContentStyle) => {
    setSelectedStyleId((prev) => (prev === style.id ? null : style.id));
  }, []);

  const selectedStyle = useMemo(() => {
    if (!profile || !selectedStyleId) return null;
    return (
      profile.postStyles.find((s) => s.id === selectedStyleId) || null
    );
  }, [profile, selectedStyleId]);

  // Weekly topics for current week
  const currentWeekTopics = useMemo(
    () => topics.filter((t) => t.weekKey === weekKey),
    [topics, weekKey]
  );

  // Total post count for this week
  const weekPostCount = useMemo(() => {
    let count = 0;
    for (const date of weekDates) {
      const dk = dateToKey(date);
      count += (posts[dk] || []).length;
    }
    return count;
  }, [weekDates, posts]);

  // ── Loading ─────────────────────────────────────────

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-fade-in">
          <div className="text-4xl mb-4 animate-float">✨</div>
          <p className="text-muted-foreground text-sm">Loading your agent...</p>
        </div>
      </div>
    );
  }

  // ── Onboarding ──────────────────────────────────────

  if (view === "onboarding" || !profile) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // ── Dashboard ──────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mesh background */}
      <div className="mesh-bg" />

      {/* Header */}
      <header className="border-b border-border/30 px-6 py-3 glass shrink-0 relative z-10">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1
              className="text-xl font-bold gradient-text"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Just Market It
            </h1>
            <div className="h-5 w-px bg-border/30" />
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setView("dashboard")}
                className={`nav-tab ${view === "dashboard" ? "active" : ""}`}
              >
                📅 Calendar
              </button>
              <button
                onClick={() => setView("email")}
                className={`nav-tab ${view === "email" ? "active" : ""}`}
              >
                📧 Emails
              </button>
              <button
                onClick={() => setView("branding")}
                className={`nav-tab ${view === "branding" ? "active" : ""}`}
              >
                🎨 Brand Kit
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-medium">{weekPostCount} posts this week</span>
            </div>
            <button
              onClick={() => {
                if (confirm("Reset onboarding? This will clear your profile.")) {
                  localStorage.removeItem("ma_profile");
                  setProfile(null);
                  setView("onboarding");
                }
              }}
              className="p-2 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {view === "dashboard" && (
          <>
            {/* Calendar area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Week nav */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-border/20 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setWeekOffset((p) => p - 1)}
                    className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <h2
                    className="text-base font-semibold text-foreground"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {weekTitle}
                  </h2>
                  <button
                    onClick={() => setWeekOffset((p) => p + 1)}
                    className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  {weekOffset !== 0 && (
                    <button
                      onClick={() => setWeekOffset(0)}
                      className="text-[11px] text-primary hover:text-primary/80 font-medium cursor-pointer ml-2"
                    >
                      Today
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    const todayKey = dateToKey(new Date());
                    handleAddPost(todayKey);
                  }}
                  className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer flex items-center gap-2"
                >
                  <span>✨</span> New Post
                </button>
              </div>

              {/* Calendar */}
              <ContentCalendar
                posts={posts}
                weekDates={weekDates}
                onSelectDay={setSelectedDateKey}
                onSelectPost={handleSelectPost}
                onAddPost={handleAddPost}
                selectedDateKey={selectedDateKey}
                profile={profile}
              />
            </div>

            {/* Right sidebar */}
            <div className="w-80 border-l border-border/20 overflow-y-auto p-5 space-y-8 shrink-0 hidden lg:block">
              {/* Weekly Topics */}
              <WeeklyTopics
                topics={currentWeekTopics}
                onAddTopic={handleAddTopic}
                onRemoveTopic={handleRemoveTopic}
                weekKey={weekKey}
              />

              <div className="h-px bg-border/10" />

              {/* Content Styles */}
              <ContentStyles
                activeStyles={profile.postStyles}
                onSelectStyle={handleSelectStyle}
                selectedStyleId={selectedStyleId}
              />
            </div>
          </>
        )}

        {view === "email" && (
          <EmailComposer
            profile={profile}
            drafts={emailDrafts}
            onSaveDraft={handleSaveEmailDraft}
            onDeleteDraft={handleDeleteEmailDraft}
          />
        )}

        {view === "branding" && (
          <BrandingKit
            profile={profile}
            brandKit={brandKit}
            onSaveBrandKit={setBrandKit}
          />
        )}
      </main>

      {/* Post Composer Modal */}
      {composerOpen && (
        <PostComposer
          profile={profile}
          post={editingPost}
          dateKey={composerDateKey}
          onSave={handleSavePost}
          onDelete={handleDeletePost}
          onClose={() => {
            setComposerOpen(false);
            setEditingPost(null);
          }}
          selectedStyle={selectedStyle}
        />
      )}
    </div>
  );
}
