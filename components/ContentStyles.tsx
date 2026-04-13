"use client";

import { ContentStyle, DEFAULT_CONTENT_STYLES } from "@/lib/types";

interface ContentStylesProps {
  activeStyles: ContentStyle[];
  onSelectStyle: (style: ContentStyle) => void;
  selectedStyleId: string | null;
}

export function ContentStyles({
  activeStyles,
  onSelectStyle,
  selectedStyleId,
}: ContentStylesProps) {
  const styles = activeStyles.length > 0 ? activeStyles : DEFAULT_CONTENT_STYLES;

  return (
    <div className="space-y-3">
      <h3
        className="text-sm font-semibold text-foreground/90"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        ✍️ Post Frameworks
      </h3>
      <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
        Select a framework to structure your AI-generated post.
      </p>

      <div className="space-y-2">
        {styles.map((style, i) => {
          const isActive = selectedStyleId === style.id;

          return (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style)}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer animate-slide-in-up stagger-${Math.min(
                i + 1,
                5
              )} ${
                isActive
                  ? "border-primary/40 bg-primary/8 shadow-sm"
                  : "border-border/20 bg-surface/30 hover:border-border/40 hover:bg-surface/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{style.emoji}</span>
                <span className="text-[13px] font-semibold text-foreground/90">
                  {style.name}
                </span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed ml-6">
                {style.description}
              </p>
              {isActive && (
                <div className="mt-2 ml-6 p-2 rounded-lg bg-background/50 border border-border/10 animate-fade-in">
                  <p className="text-[10px] text-muted-foreground/50 font-mono whitespace-pre-line leading-relaxed">
                    {style.structure}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
