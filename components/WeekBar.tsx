"use client";

import { WeekSchedules } from "@/lib/types";
import { dateToKey } from "@/lib/structureEngine";

interface WeekBarProps {
  weekDates: Date[];
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (dateKey: string) => void;
  schedules: WeekSchedules;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeekBar({
  weekDates,
  selectedDate,
  onSelectDate,
  schedules,
}: WeekBarProps) {
  const todayKey = dateToKey(new Date());

  return (
    <div className="flex gap-1.5 px-1">
      {weekDates.map((date, i) => {
        const key = dateToKey(date);
        const isSelected = key === selectedDate;
        const isToday = key === todayKey;
        const blocks = schedules[key] || [];
        const taskBlocks = blocks.filter((b) => !b.isBreak);
        const hasSchedule = taskBlocks.length > 0;
        const completedCount = taskBlocks.filter((b) => b.isCompleted).length;
        const allDone = hasSchedule && completedCount === taskBlocks.length;

        return (
          <button
            key={key}
            id={`week-tab-${key}`}
            onClick={() => onSelectDate(key)}
            className={`
              flex-1 py-2.5 px-1 rounded-lg border text-center
              week-tab cursor-pointer relative
              ${
                isSelected
                  ? "active border-copper/60 bg-surface-elevated"
                  : "border-transparent hover:border-border"
              }
            `}
          >
            {/* Day name */}
            <div
              className={`text-[10px] uppercase tracking-wider font-semibold ${
                isSelected
                  ? "text-copper"
                  : isToday
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {DAY_NAMES[i]}
            </div>

            {/* Date number */}
            <div
              className={`text-lg leading-tight font-medium ${
                isSelected
                  ? "text-foreground"
                  : isToday
                  ? "text-foreground/90"
                  : "text-foreground/60"
              }`}
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {date.getDate()}
            </div>

            {/* Task count */}
            {hasSchedule && (
              <div
                className={`text-[9px] font-medium mt-0.5 ${
                  allDone ? "text-copper/70" : "text-muted-foreground"
                }`}
              >
                {allDone ? "✓" : taskBlocks.length}
              </div>
            )}

            {/* Today dot */}
            {isToday && (
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-copper" />
            )}

            {/* Has schedule indicator */}
            {hasSchedule && !isSelected && (
              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-copper/40" />
            )}
          </button>
        );
      })}
    </div>
  );
}
