"use client";

import { useState, useEffect, useRef } from "react";
import { TimeBlock, ENERGY_CONFIG, PRIORITY_CONFIG } from "@/lib/types";

interface TimelineProps {
  blocks: TimeBlock[];
  onToggleComplete: (blockId: string) => void;
  onReorderBlocks: (blocks: TimeBlock[]) => void;
  onDeleteBlock?: (blockId: string) => void;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getCurrentTimePosition(
  startTime: string,
  endTime: string
): number | null {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  if (nowMin < startMin || nowMin > endMin) return null;
  return ((nowMin - startMin) / (endMin - startMin)) * 100;
}

export function Timeline({
  blocks,
  onToggleComplete,
  onReorderBlocks,
  onDeleteBlock,
}: TimelineProps) {
  const [currentTimePos, setCurrentTimePos] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Update current time indicator
  useEffect(() => {
    if (blocks.length === 0) return;

    const firstBlock = blocks[0];
    const lastBlock = blocks[blocks.length - 1];

    const update = () => {
      const pos = getCurrentTimePosition(
        firstBlock.startTime,
        lastBlock.endTime
      );
      setCurrentTimePos(pos);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [blocks]);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const newBlocks = [...blocks];
    const temp = { ...newBlocks[draggedIdx] };
    newBlocks[draggedIdx] = {
      ...newBlocks[draggedIdx],
      taskId: newBlocks[targetIdx].taskId,
      taskTitle: newBlocks[targetIdx].taskTitle,
      energyLevel: newBlocks[targetIdx].energyLevel,
      priority: newBlocks[targetIdx].priority,
      isCompleted: newBlocks[targetIdx].isCompleted,
      isMandatory: newBlocks[targetIdx].isMandatory,
    };
    newBlocks[targetIdx] = {
      ...newBlocks[targetIdx],
      taskId: temp.taskId,
      taskTitle: temp.taskTitle,
      energyLevel: temp.energyLevel,
      priority: temp.priority,
      isCompleted: temp.isCompleted,
      isMandatory: temp.isMandatory,
    };

    onReorderBlocks(newBlocks);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
        <div className="text-6xl mb-6 animate-gentle-bounce">⚙️</div>
        <h3
          className="text-2xl mb-2 text-foreground/80"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Ready to structure your day?
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Add tasks to your backlog, then hit{" "}
          <span className="text-copper font-medium">Structure My Day</span> to
          generate your deep work timeline.
        </p>
      </div>
    );
  }

  const lastTime = blocks[blocks.length - 1].endTime;

  return (
    <div ref={timelineRef} className="relative py-4 px-3">
      {/* Current time indicator */}
      {currentTimePos !== null && (
        <div
          className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
          style={{ top: `${currentTimePos}%` }}
        >
          <div className="w-3 h-3 rounded-full bg-copper animate-pulse-line" />
          <div className="flex-1 h-[2px] bg-copper/60 animate-pulse-line" />
          <span className="text-[10px] text-copper font-semibold ml-1">
            NOW
          </span>
        </div>
      )}

      {/* Timeline blocks */}
      <div className="space-y-1.5">
        {blocks.map((block, i) => {
          const energyConf = ENERGY_CONFIG[block.energyLevel];
          const isBreak = block.isBreak;

          if (isBreak) {
            return (
              <div
                key={block.id}
                className={`flex items-center gap-3 py-2.5 px-3 animate-slide-in-up stagger-${Math.min(
                  i + 1,
                  10
                )}`}
              >
                <span className="text-[11px] text-muted-foreground w-14 text-right font-mono font-medium">
                  {block.startTime}
                </span>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 border-t border-dashed border-border" />
                  <span className="text-[11px] text-muted-foreground/70 italic whitespace-nowrap">
                    ☕ break · {block.durationMinutes}m
                  </span>
                  <div className="flex-1 border-t border-dashed border-border" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={block.id}
              id={`timeline-block-${block.id}`}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              className={`
                flex gap-3 p-3.5 rounded-lg border cursor-grab
                transition-all duration-200
                animate-slide-in-up stagger-${Math.min(i + 1, 10)}
                ${
                  block.isCompleted
                    ? "bg-card/40 border-border/30"
                    : "bg-card border-border card-lift hover:border-copper/30"
                }
                ${dragOverIdx === i ? "ring-1 ring-copper/50" : ""}
                ${draggedIdx === i ? "opacity-50 rotate-1" : ""}
              `}
            >
              {/* Time column — BOLDER, LARGER */}
              <div className="flex flex-col items-end shrink-0 w-14 pt-0.5">
                <span className="text-sm font-mono font-semibold text-foreground/80">
                  {block.startTime}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {block.endTime}
                </span>
              </div>

              {/* Duration bar */}
              <div
                className="w-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor: energyConf.color,
                  opacity: block.isCompleted ? 0.3 : 0.8,
                  minHeight: `${Math.max(block.durationMinutes * 0.8, 32)}px`,
                }}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-tight ${
                        block.isCompleted
                          ? "line-through text-muted-foreground/50"
                          : "text-foreground"
                      }`}
                    >
                      {block.isMandatory && (
                        <span className="mr-1 opacity-50">🔁</span>
                      )}
                      {block.taskTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {block.durationMinutes}m
                      </span>
                      <span
                        className="text-[11px] px-1.5 py-0.5 rounded font-semibold"
                        style={{
                          backgroundColor: `color-mix(in oklch, ${energyConf.color} 20%, transparent)`,
                          color: block.isCompleted
                            ? "var(--muted-foreground)"
                            : energyConf.color,
                        }}
                      >
                        {energyConf.emoji} {energyConf.label}
                      </span>
                      <span className="text-xs leading-none">
                        {PRIORITY_CONFIG[block.priority].emoji}
                      </span>
                    </div>
                  </div>

                  {/* Complete toggle */}
                  <div className="flex items-center gap-1">
                    <button
                      id={`timeline-complete-${block.id}`}
                      onClick={() => onToggleComplete(block.id)}
                      className={`
                        w-7 h-7 rounded-full border-2 flex items-center justify-center
                        transition-all cursor-pointer shrink-0
                        ${
                          block.isCompleted
                            ? "bg-copper border-copper scale-100"
                            : "border-muted-foreground/30 hover:border-copper hover:scale-105"
                        }
                      `}
                    >
                      {block.isCompleted && (
                        <svg
                          width="12"
                          height="10"
                          viewBox="0 0 10 8"
                          fill="none"
                          className="text-copper-foreground"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                    {onDeleteBlock && !block.isMandatory && (
                      <button
                        onClick={() => onDeleteBlock(block.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                        title="Return to backlog"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* End time */}
      <div className="flex items-center gap-3 pt-3 px-3">
        <span className="text-[11px] text-muted-foreground w-14 text-right font-mono font-medium">
          {lastTime}
        </span>
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-[11px] text-muted-foreground/60">End of day</span>
      </div>
    </div>
  );
}
