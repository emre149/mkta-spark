"use client";

import { useState } from "react";
import { DaySettings } from "@/lib/types";

interface DaySettingsBarProps {
  settings: DaySettings;
  onSettingsChange: (settings: DaySettings) => void;
  onStructureDay: () => void;
  onStructureWeek: () => void;
  onAIStructure?: () => void;
  hasTasksToStructure: boolean;
  hasApiKey?: boolean;
}

export function DaySettingsBar({
  settings,
  onSettingsChange,
  onStructureDay,
  onStructureWeek,
  onAIStructure,
  hasTasksToStructure,
  hasApiKey,
}: DaySettingsBarProps) {
  const [pressedBtn, setPressedBtn] = useState<"day" | "week" | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleStructureDay = () => {
    setPressedBtn("day");
    setTimeout(() => {
      onStructureDay();
      setPressedBtn(null);
    }, 200);
  };

  const handleStructureWeek = () => {
    setPressedBtn("week");
    setTimeout(() => {
      onStructureWeek();
      setPressedBtn(null);
    }, 200);
  };

  return (
    <div className="rounded-xl bg-card border border-border p-4 space-y-4">
      <div className="text-center">
        <h2
          className="text-xl tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {today}
        </h2>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground font-medium">
            From
          </label>
          <input
            id="start-time"
            type="time"
            value={settings.startTime}
            onChange={(e) =>
              onSettingsChange({ ...settings, startTime: e.target.value })
            }
            className="bg-surface border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground w-[110px] cursor-pointer"
          />
        </div>
        <span className="text-muted-foreground/50">→</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground font-medium">
            To
          </label>
          <input
            id="end-time"
            type="time"
            value={settings.endTime}
            onChange={(e) =>
              onSettingsChange({ ...settings, endTime: e.target.value })
            }
            className="bg-surface border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground w-[110px] cursor-pointer"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <button
            id="structure-day-btn"
            onClick={handleStructureDay}
            disabled={!hasTasksToStructure}
            className={`
              w-full py-3 rounded-xl text-sm font-semibold tracking-wide uppercase
              bg-copper text-copper-foreground cursor-pointer btn-mechanical
              disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none
              ${pressedBtn === "day" ? "animate-press" : ""}
            `}
          >
            ⚙️ Day
          </button>

          {/* AI sparkle button */}
          {onAIStructure && (
            <button
              id="ai-structure-btn"
              onClick={onAIStructure}
              title={
                hasApiKey
                  ? "AI-powered scheduling"
                  : "Set API key in Settings first"
              }
              className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[11px]
                cursor-pointer transition-all hover:scale-110
                ${
                  hasApiKey
                    ? "bg-copper text-copper-foreground shadow-md"
                    : "bg-surface text-muted-foreground border border-border"
                }
              `}
            >
              ✨
            </button>
          )}
        </div>

        <button
          id="structure-week-btn"
          onClick={handleStructureWeek}
          disabled={!hasTasksToStructure}
          className={`
            flex-1 py-3 rounded-xl text-sm font-semibold tracking-wide uppercase
            bg-surface-elevated text-foreground/80 border border-border cursor-pointer btn-mechanical
            disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none hover:text-foreground
            ${pressedBtn === "week" ? "animate-press" : ""}
          `}
        >
          📅 Week
        </button>
      </div>
    </div>
  );
}
