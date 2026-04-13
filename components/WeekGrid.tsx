"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import {
  TimeBlock,
  WeekSchedules,
  ENERGY_COLORS,
  ENERGY_CONFIG,
  EnergyLevel,
} from "@/lib/types";
import { dateToKey } from "@/lib/structureEngine";

interface WeekGridProps {
  weekDates: Date[];
  schedules: WeekSchedules;
  startTime: string;
  endTime: string;
  onDayClick: (dateKey: string) => void;
  onBlockClick: (block: TimeBlock, dateKey: string) => void;
  onStartFocus: (block: TimeBlock, dateKey: string) => void;
  onToggleComplete: (blockId: string, dateKey: string) => void;
  onDeleteBlock: (blockId: string, dateKey: string) => void;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatHour(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function WeekGrid({
  weekDates,
  schedules,
  startTime,
  endTime,
  onDayClick,
  onStartFocus,
  onToggleComplete,
  onDeleteBlock,
}: WeekGridProps) {
  const todayKey = dateToKey(new Date());
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const totalMin = endMin - startMin;
  const SLOT_HEIGHT = 48;
  const totalSlots = Math.ceil(totalMin / 30);
  const gridRef = useRef<HTMLDivElement>(null);

  const [activePopover, setActivePopover] = useState<{
    block: TimeBlock;
    dateKey: string;
    x: number;
    y: number;
  } | null>(null);

  const [nowPosition, setNowPosition] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin >= startMin && nowMin <= endMin) {
        setNowPosition(((nowMin - startMin) / totalMin) * 100);
      } else {
        setNowPosition(null);
      }
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [startMin, endMin, totalMin]);

  useEffect(() => {
    if (!activePopover) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-popover]")) {
        setActivePopover(null);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [activePopover]);

  const timeLabels = useMemo(() => {
    const labels: { time: string; top: number }[] = [];
    for (let i = 0; i <= totalSlots; i++) {
      const min = startMin + i * 30;
      if (min > endMin) break;
      labels.push({ time: formatHour(min), top: i * SLOT_HEIGHT });
    }
    return labels;
  }, [startMin, endMin, totalSlots]);

  const gridHeight = totalSlots * SLOT_HEIGHT;

  const handleBlockClick = (
    e: React.MouseEvent,
    block: TimeBlock,
    dateKey: string
  ) => {
    e.stopPropagation();
    if (block.isBreak) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setActivePopover({
      block,
      dateKey,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 4,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div
        className="border-b border-border/40 sticky top-0 z-20 bg-background/95 backdrop-blur-sm"
        style={{
          display: "grid",
          gridTemplateColumns: "56px repeat(5, 1fr) 0.7fr 0.7fr",
        }}
      >
        <div className="py-2" />
        {weekDates.map((date, i) => {
          const key = dateToKey(date);
          const isToday = key === todayKey;
          const blocks = (schedules[key] || []).filter((b) => !b.isBreak);
          // Count only non-completed tasks
          const activeCount = blocks.filter((b) => !b.isCompleted).length;
          const allDone = blocks.length > 0 && activeCount === 0;

          return (
            <button
              key={key}
              onClick={() => onDayClick(key)}
              className={`py-2.5 text-center cursor-pointer transition-colors hover:bg-surface/50 ${
                isToday ? "bg-copper/5" : ""
              }`}
            >
              <div
                className={`text-[10px] uppercase tracking-wider font-semibold ${
                  isToday ? "text-copper" : "text-muted-foreground"
                }`}
              >
                {DAY_NAMES[i]}
              </div>
              <div
                className={`text-base leading-tight font-semibold ${
                  isToday ? "text-foreground" : "text-foreground/70"
                }`}
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                {date.getDate()}
              </div>
              {blocks.length > 0 && (
                <div className="text-[9px] text-muted-foreground font-medium">
                  {allDone ? "✓ done" : `${activeCount} left`}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid body */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        ref={gridRef}
      >
        <div
          className="relative"
          style={{
            display: "grid",
            gridTemplateColumns: "56px repeat(5, 1fr) 0.7fr 0.7fr",
            height: `${gridHeight}px`,
          }}
        >
          {/* Time axis */}
          <div className="relative">
            {timeLabels.map((label) => (
              <div
                key={label.time}
                className="absolute right-2 text-[11px] font-mono font-semibold text-muted-foreground"
                style={{ top: `${label.top}px`, transform: "translateY(-50%)" }}
              >
                {label.time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((date, colIdx) => {
            const key = dateToKey(date);
            const isToday = key === todayKey;
            const dayBlocks = schedules[key] || [];

            return (
              <div
                key={key}
                className={`relative week-grid-col ${isToday ? "today" : ""}`}
                onClick={() => onDayClick(key)}
                style={{ cursor: "pointer" }}
              >
                {timeLabels.map((label) => (
                  <div
                    key={label.time}
                    className="week-grid-line absolute left-0 right-0"
                    style={{ top: `${label.top}px` }}
                  />
                ))}

                {dayBlocks
                  .filter((b) => !b.isBreak)
                  .map((block) => {
                    const blockStart = timeToMinutes(block.startTime);
                    const blockEnd = timeToMinutes(block.endTime);
                    const top =
                      ((blockStart - startMin) / totalMin) * gridHeight;
                    const height =
                      ((blockEnd - blockStart) / totalMin) * gridHeight;
                    const energyColor =
                      ENERGY_COLORS[block.energyLevel as EnergyLevel];

                    return (
                      <div
                        key={block.id}
                        className={`week-block ${
                          block.isCompleted ? "completed" : ""
                        }`}
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height - 2, 20)}px`,
                          backgroundColor: `color-mix(in oklch, ${energyColor} 18%, var(--card))`,
                          borderLeftWidth: "3px",
                          borderLeftColor: energyColor,
                        }}
                        onClick={(e) => handleBlockClick(e, block, key)}
                      >
                        <div
                          className={`text-[11px] font-medium leading-tight truncate ${
                            block.isCompleted
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {block.isMandatory && (
                            <span className="opacity-50 mr-0.5">🔁</span>
                          )}
                          {block.taskTitle}
                        </div>
                        {height > 28 && (
                          <div className="text-[9px] text-muted-foreground mt-0.5">
                            {block.durationMinutes}m
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* Current time indicator */}
                {isToday && nowPosition !== null && (
                  <div
                    className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                    style={{
                      top: `${(nowPosition / 100) * gridHeight}px`,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-copper" />
                    <div className="flex-1 h-[2px] bg-copper/60" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Block popover */}
      {activePopover && (
        <div
          data-popover
          className="fixed z-50 animate-slide-in-up"
          style={{
            left: `${Math.min(Math.max(activePopover.x - 120, 8), (typeof window !== "undefined" ? window.innerWidth : 1200) - 260)}px`,
            top: `${Math.min(activePopover.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 220)}px`,
          }}
        >
          <div className="bg-popover border border-border rounded-xl shadow-xl p-3 w-[240px] space-y-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">
                {activePopover.block.taskTitle}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {activePopover.block.startTime} →{" "}
                {activePopover.block.endTime} ·{" "}
                {activePopover.block.durationMinutes}m
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${
                      ENERGY_CONFIG[activePopover.block.energyLevel].color
                    } 20%, transparent)`,
                    color:
                      ENERGY_CONFIG[activePopover.block.energyLevel].color,
                  }}
                >
                  {ENERGY_CONFIG[activePopover.block.energyLevel].emoji}{" "}
                  {ENERGY_CONFIG[activePopover.block.energyLevel].label}
                </span>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  onToggleComplete(
                    activePopover.block.id,
                    activePopover.dateKey
                  );
                  setActivePopover(null);
                }}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold bg-copper text-copper-foreground hover:bg-copper/90 cursor-pointer transition-colors"
              >
                {activePopover.block.isCompleted ? "Undo ↩" : "Done ✓"}
              </button>
              <button
                onClick={() => {
                  onStartFocus(activePopover.block, activePopover.dateKey);
                  setActivePopover(null);
                }}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold bg-surface-elevated text-foreground border border-border hover:bg-accent cursor-pointer transition-colors"
              >
                Focus ▶
              </button>
              <button
                onClick={() => {
                  onDeleteBlock(
                    activePopover.block.id,
                    activePopover.dateKey
                  );
                  setActivePopover(null);
                }}
                className="py-1.5 px-2.5 rounded-lg text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border cursor-pointer transition-colors"
                title="Return to backlog"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
