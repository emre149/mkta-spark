"use client";

import { useState } from "react";
import {
  SocialPost,
  ContentStyle,
  MarketingProfile,
  Platform,
  PostType,
  PLATFORM_CONFIG,
  DEFAULT_CONTENT_STYLES,
} from "@/lib/types";

interface PostComposerProps {
  profile: MarketingProfile;
  post?: SocialPost | null;
  dateKey: string;
  onSave: (post: SocialPost) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  selectedStyle: ContentStyle | null;
}

function generateId(): string {
  return `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function PostComposer({
  profile,
  post,
  dateKey,
  onSave,
  onDelete,
  onClose,
  selectedStyle,
}: PostComposerProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [platform, setPlatform] = useState<Platform>(post?.platform || "twitter");
  const [postType, setPostType] = useState<PostType>(post?.postType || "tweet");
  const [scheduledTime, setScheduledTime] = useState(post?.scheduledTime || "10:00");
  const [isGenerating, setIsGenerating] = useState(false);

  const activeStyles = profile.postStyles.length > 0 ? profile.postStyles : DEFAULT_CONTENT_STYLES;
  const currentStyle = selectedStyle || activeStyles[0];

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Simulate AI generation with context
    const avatar = profile.targetAvatars[0];
    const prompts: Record<string, string> = {
      pas: `Problem: ${avatar?.painPoints?.[0] || "time"}\n\nMost ${avatar?.name || "builders"} struggle with ${avatar?.painPoints?.[0] || "this"}.\n\nThe worst part? It compounds. Every day without a system is another day lost.\n\n${profile.projectName} fixes this.\n${profile.valueProposition || "Try it today."}`,
      "hook-value": `Stop doing ${avatar?.painPoints?.[0] || "everything manually"}.\n\nHere's what I learned building ${profile.projectName}:\n\n1. Automate the repetitive\n2. Focus on what compounds\n3. Ship fast, iterate faster\n4. Let AI handle the rest\n\n${profile.valueProposition || "The future is automated"} 🚀`,
      story: `6 months ago, ${profile.projectName} was just an idea.\n\nI was ${avatar?.painPoints?.[0] || "struggling"} like everyone else.\n\nThen I built a system:\n→ ${profile.valueProposition || "It changed everything"}\n\nThe lesson? Start before you're ready.`,
      contrarian: `Unpopular opinion:\n\nYou don't need more followers.\nYou need better systems.\n\n${profile.projectName} proves it:\n${profile.valueProposition || "Quality > Quantity"}\n\nHere's why the mainstream approach fails...`,
      listicle: `5 things I wish I knew before building ${profile.projectName}:\n\n1. Start with the problem, not the solution\n2. Your first users are your best advisors\n3. Launch ugly, polish later\n4. Consistency > perfection\n5. ${profile.valueProposition || "Build in public"}\n\nWhich one resonates?`,
    };

    await new Promise((r) => setTimeout(r, 1200));

    const generated = prompts[currentStyle?.id] || prompts.pas;
    setContent(generated);
    setTitle(`${currentStyle?.emoji || "📝"} ${currentStyle?.name || "Post"} — ${profile.projectName}`);
    setIsGenerating(false);
  };

  const handleSave = () => {
    const savedPost: SocialPost = {
      id: post?.id || generateId(),
      title,
      content,
      platform,
      postType,
      status: "scheduled",
      scheduledDate: dateKey,
      scheduledTime,
      styleId: currentStyle?.id,
      tags: [],
      createdAt: post?.createdAt || new Date().toISOString(),
    };
    onSave(savedPost);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-2xl glass-elevated rounded-2xl p-0 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/20">
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              {post ? "Edit Post" : "New Post"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {dateKey} · {currentStyle?.emoji} {currentStyle?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Platform & Type row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Platform
              </label>
              <div className="flex gap-2">
                {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((p) => {
                  const conf = PLATFORM_CONFIG[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`tag cursor-pointer ${platform === p ? "active" : ""}`}
                      style={
                        platform === p
                          ? { borderColor: `${conf.color}50`, background: `${conf.color}15`, color: conf.color }
                          : {}
                      }
                    >
                      {conf.emoji} {conf.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Post type */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Type
            </label>
            <div className="flex gap-2">
              {(["tweet", "thread", "linkedin", "story"] as PostType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPostType(t)}
                  className={`tag cursor-pointer ${postType === t ? "active" : ""}`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Title (internal)
            </label>
            <input
              className="input-dark"
              placeholder="Quick reference title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Content
              </label>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-primary px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin-slow">✨</span> Generating...
                  </>
                ) : (
                  <>
                    ✨ AI Generate
                  </>
                )}
              </button>
            </div>
            <textarea
              className="textarea-dark !min-h-[200px] font-mono text-[13px] leading-relaxed"
              placeholder="Write your post content or click AI Generate..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {content && (
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground/50">
                  {content.length} chars
                  {platform === "twitter" && content.length > 280 && (
                    <span className="text-destructive ml-1">
                      (over 280 limit)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Schedule time */}
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Schedule Time
              </label>
              <input
                type="time"
                className="input-dark !w-auto !py-2"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/20 bg-surface/20">
          <div>
            {post && onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="text-xs text-destructive/60 hover:text-destructive cursor-pointer transition-colors"
              >
                Delete post
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="btn-ghost px-4 py-2 rounded-lg text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-30"
            >
              {post ? "Update" : "Schedule"} Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
