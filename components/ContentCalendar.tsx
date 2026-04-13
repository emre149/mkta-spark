"use client";

import { useState } from "react";
import {
  SocialPost,
  PLATFORM_CONFIG,
  STATUS_CONFIG,
  MarketingProfile,
} from "@/lib/types";

interface ContentCalendarProps {
  posts: Record<string, SocialPost[]>;
  weekDates: Date[];
  onSelectDay: (dateKey: string) => void;
  onSelectPost: (post: SocialPost) => void;
  onAddPost: (dateKey: string) => void;
  selectedDateKey: string | null;
  profile: MarketingProfile;
}

function dateToKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ContentCalendar({
  posts,
  weekDates,
  onSelectDay,
  onSelectPost,
  onAddPost,
  selectedDateKey,
}: ContentCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const todayKey = dateToKey(new Date());

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 px-4 pt-3 pb-2">
        {DAY_LABELS.map((label, i) => {
          const dk = weekDates[i] ? dateToKey(weekDates[i]) : "";
          const isToday = dk === todayKey;
          return (
            <div key={label} className="text-center">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </span>
              <div
                className={`text-lg font-semibold mt-0.5 ${
                  isToday ? "gradient-text" : "text-foreground/80"
                }`}
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                {weekDates[i]?.getDate() || ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 px-4 pb-4 flex-1">
        {weekDates.map((date, i) => {
          const dk = dateToKey(date);
          const dayPosts = posts[dk] || [];
          const isToday = dk === todayKey;
          const isSelected = dk === selectedDateKey;
          const isHovered = dk === hoveredDay;

          return (
            <div
              key={dk}
              className={`calendar-day flex flex-col cursor-pointer relative group ${
                isToday ? "today" : ""
              } ${isSelected ? "!border-primary/50 !bg-primary/5" : ""}`}
              onClick={() => onSelectDay(dk)}
              onMouseEnter={() => setHoveredDay(dk)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Posts */}
              <div className="flex-1 space-y-1.5 overflow-y-auto">
                {dayPosts.map((post) => {
                  const platformConf =
                    PLATFORM_CONFIG[post.platform as keyof typeof PLATFORM_CONFIG];
                  const statusConf =
                    STATUS_CONFIG[post.status as keyof typeof STATUS_CONFIG];

                  return (
                    <button
                      key={post.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPost(post);
                      }}
                      className="w-full text-left post-card p-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="platform-badge"
                          style={{
                            backgroundColor: `${platformConf?.color}20`,
                            color: platformConf?.color,
                          }}
                        >
                          {platformConf?.emoji}
                        </span>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: statusConf?.color }}
                        />
                      </div>
                      <p className="text-[11px] text-foreground/80 font-medium leading-tight line-clamp-2">
                        {post.title || post.content.slice(0, 60)}
                      </p>
                      {post.scheduledTime && (
                        <span className="text-[10px] text-muted-foreground/60 font-mono mt-1 block">
                          {post.scheduledTime}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Add button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddPost(dk);
                }}
                className={`mt-1 w-full py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  isHovered || isSelected
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground/30 hover:text-muted-foreground/60"
                }`}
              >
                + Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
