"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TimeBlock, ENERGY_CONFIG } from "@/lib/types";

interface FocusModeProps {
  block: TimeBlock;
  onComplete: () => void;
  onExit: () => void;
}

export function FocusMode({ block, onComplete, onExit }: FocusModeProps) {
  const totalSeconds = block.durationMinutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const progress = 1 - remaining / totalSeconds;

  // Timer logic
  useEffect(() => {
    if (isPaused || isCompleting) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          // Time's up — auto complete
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, isCompleting]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleComplete = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsCompleting(true);
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onComplete();
      }, 300);
    }, 800);
  }, [onComplete]);

  const handleExit = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsExiting(true);
    setTimeout(() => {
      onExit();
    }, 250);
  }, [onExit]);

  const energyConf = ENERGY_CONFIG[block.energyLevel];

  return (
    <div
      className={`focus-overlay ${
        isExiting ? "animate-focus-out" : "animate-focus-in"
      }`}
    >
      {/* Completion overlay */}
      {isCompleting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="animate-check-pop">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              className="text-copper"
            >
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.3"
              />
              <path
                d="M24 40L34 50L56 28"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={`flex flex-col items-center max-w-md mx-auto px-8 transition-opacity duration-300 ${
          isCompleting ? "opacity-20" : "opacity-100"
        }`}
      >
        {/* Energy indicator */}
        <div
          className="text-[11px] px-3 py-1 rounded-full font-semibold mb-6"
          style={{
            backgroundColor: `color-mix(in oklch, ${energyConf.color} 20%, transparent)`,
            color: energyConf.color,
          }}
        >
          {energyConf.emoji} {energyConf.label} Energy Block
        </div>

        {/* Task title */}
        <h1
          className="text-3xl sm:text-4xl text-center text-foreground leading-tight mb-8"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {block.taskTitle}
        </h1>

        {/* Timer */}
        <div
          className={`text-7xl sm:text-8xl font-light tracking-wider mb-6 focus-timer ${
            isPaused
              ? "text-muted-foreground"
              : remaining < 300
              ? "text-copper animate-timer-pulse"
              : "text-foreground"
          }`}
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          {formatTime(remaining)}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs h-1.5 rounded-full bg-surface overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-copper transition-all duration-1000"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground mb-10">
          {block.durationMinutes}m block · {Math.round(progress * 100)}%
          complete
        </p>

        {/* Controls */}
        <div className="flex gap-3">
          {isPaused ? (
            <>
              <button
                onClick={() => setIsPaused(false)}
                className="px-8 py-3 rounded-xl text-sm font-semibold bg-copper text-copper-foreground cursor-pointer btn-mechanical"
              >
                Resume ▶
              </button>
              <button
                onClick={handleExit}
                className="px-8 py-3 rounded-xl text-sm font-semibold bg-surface text-foreground/70 border border-border cursor-pointer hover:text-foreground transition-colors"
              >
                Stop ■
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleComplete}
                className="px-8 py-3 rounded-xl text-sm font-semibold bg-copper text-copper-foreground cursor-pointer btn-mechanical"
              >
                Done ✓
              </button>
              <button
                onClick={() => setIsPaused(true)}
                className="px-8 py-3 rounded-xl text-sm font-semibold bg-surface text-foreground/70 border border-border cursor-pointer hover:text-foreground transition-colors"
              >
                Pause ⏸
              </button>
            </>
          )}
        </div>

        {/* Paused state label */}
        {isPaused && (
          <p className="text-sm text-muted-foreground mt-6 animate-pulse">
            ⏸ Paused
          </p>
        )}
      </div>

      {/* Escape hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <p className="text-[10px] text-muted-foreground/40">
          Press Esc to exit focus mode
        </p>
      </div>
    </div>
  );
}
