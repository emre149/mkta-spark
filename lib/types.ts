// ── Marketing Agent Types ─────────────────────────────────

export interface MarketingProfile {
  projectName: string;
  projectDescription: string;
  valueProposition: string;
  targetAvatars: TargetAvatar[];
  postStyles: ContentStyle[];
  emailPreferences: EmailPreferences;
  onboardingCompleted: boolean;
}

export interface TargetAvatar {
  id: string;
  name: string;
  description: string;
  painPoints: string[];
  goals: string[];
  platforms: Platform[];
}

export type Platform = "twitter" | "linkedin" | "instagram" | "newsletter";

export interface ContentStyle {
  id: string;
  name: string;
  description: string;
  structure: string; // e.g. "Hook → Problem → Solution → CTA"
  example: string;
  emoji: string;
}

export interface EmailPreferences {
  tone: "formal" | "casual" | "bold";
  frequency: "daily" | "weekly" | "biweekly";
  ctaStyle: string;
}

// ── Posts & Calendar ──────────────────────────────────────

export type PostStatus = "draft" | "scheduled" | "published";
export type PostType = "tweet" | "thread" | "linkedin" | "email" | "story";

export interface SocialPost {
  id: string;
  title: string;
  content: string;
  platform: Platform;
  postType: PostType;
  status: PostStatus;
  scheduledDate: string; // "YYYY-MM-DD"
  scheduledTime?: string; // "HH:MM"
  styleId?: string; // links to ContentStyle.id
  avatarId?: string; // which avatar this targets
  tags: string[];
  createdAt: string;
}

export type WeeklyPosts = Record<string, SocialPost[]>; // dateKey → posts

// ── Weekly Topics ────────────────────────────────────────

export interface WeeklyTopic {
  id: string;
  topic: string;
  notes: string;
  weekKey: string; // "YYYY-WW"
}

// ── Email Drafts ─────────────────────────────────────────

export interface EmailDraft {
  id: string;
  subject: string;
  body: string;
  targetAvatarId?: string;
  status: "draft" | "ready" | "sent";
  createdAt: string;
}

// ── Branding Kit ─────────────────────────────────────────

export interface BrandKit {
  projectName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPrimary: string;
  fontSecondary: string;
  logoSvg?: string;
  twitterBannerUrl?: string;
  generatedAt: string;
}

// ── Chat types ───────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// ── App View ─────────────────────────────────────────────

export type AppView = "onboarding" | "dashboard" | "email" | "branding";

// ── Config ───────────────────────────────────────────────

export const PLATFORM_CONFIG = {
  twitter: { label: "X / Twitter", emoji: "𝕏", color: "#1DA1F2" },
  linkedin: { label: "LinkedIn", emoji: "in", color: "#0A66C2" },
  instagram: { label: "Instagram", emoji: "📸", color: "#E4405F" },
  newsletter: { label: "Newsletter", emoji: "📧", color: "#8B5CF6" },
} as const;

export const POST_TYPE_CONFIG = {
  tweet: { label: "Tweet", emoji: "💬" },
  thread: { label: "Thread", emoji: "🧵" },
  linkedin: { label: "LinkedIn Post", emoji: "📝" },
  email: { label: "Email", emoji: "📧" },
  story: { label: "Story", emoji: "📱" },
} as const;

export const STATUS_CONFIG = {
  draft: { label: "Draft", color: "var(--muted-foreground)", bg: "var(--muted)" },
  scheduled: { label: "Scheduled", color: "var(--copper)", bg: "oklch(0.65 0.12 55 / 0.15)" },
  published: { label: "Published", color: "var(--energy-low)", bg: "oklch(0.68 0.12 265 / 0.15)" },
  ready: { label: "Ready", color: "var(--energy-medium)", bg: "oklch(0.72 0.12 82 / 0.15)" },
  sent: { label: "Sent", color: "var(--energy-low)", bg: "oklch(0.68 0.12 265 / 0.15)" },
} as const;

// ── Default Styles ───────────────────────────────────────

export const DEFAULT_CONTENT_STYLES: ContentStyle[] = [
  {
    id: "pas",
    name: "PAS Framework",
    description: "Problem → Agitate → Solution",
    structure: "1. State the problem\n2. Agitate — make it painful\n3. Present your solution",
    example: "Most builders spend 4h/day on marketing.\nThat's 100h/month NOT building.\nWhat if AI did it in 10 minutes?",
    emoji: "🎯",
  },
  {
    id: "hook-value",
    name: "Hook + Value",
    description: "Strong hook → deliver value → CTA",
    structure: "1. Bold statement or question\n2. 3-5 value points\n3. Call to action",
    example: "Stop posting random content.\n\nHere's the 5-step system I use:\n1. ...\n2. ...\nRetweet if this helped 🔄",
    emoji: "🪝",
  },
  {
    id: "story",
    name: "Micro-Story",
    description: "Personal anecdote → lesson → takeaway",
    structure: "1. Set the scene\n2. The conflict/challenge\n3. What you learned\n4. Key takeaway for audience",
    example: "6 months ago I had 200 followers.\nI was posting daily but no one cared.\nThen I changed ONE thing...",
    emoji: "📖",
  },
  {
    id: "contrarian",
    name: "Contrarian Take",
    description: "Go against popular opinion with proof",
    structure: "1. Unpopular opinion\n2. Why the mainstream is wrong\n3. Your evidence\n4. Reframe",
    example: "Unpopular opinion:\nYou don't need a content strategy.\nYou need a content SYSTEM.\nHere's the difference...",
    emoji: "🔥",
  },
  {
    id: "listicle",
    name: "Listicle",
    description: "Numbered tips or insights",
    structure: "1. Topic intro in one line\n2. Numbered list of items\n3. Wrap-up or CTA",
    example: "7 tools I use daily as a solo builder:\n\n1. Cursor — AI coding\n2. Typefully — scheduling\n...",
    emoji: "📋",
  },
];
