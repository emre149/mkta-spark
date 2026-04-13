"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Task,
  EnergyLevel,
  Priority,
  ENERGY_CONFIG,
  PRIORITY_CONFIG,
} from "@/lib/types";

interface TaskInputProps {
  onAddTask: (task: Omit<Task, "id" | "isCompleted" | "order">) => void;
  isMandatory?: boolean;
}

export function TaskInput({ onAddTask, isMandatory = false }: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  const [energy, setEnergy] = useState<EnergyLevel>("medium");
  const [priority, setPriority] = useState<Priority>("normal");
  const [deadline, setDeadline] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (!minutes || parseInt(minutes) <= 0) return;

    onAddTask({
      title: title.trim(),
      estimatedMinutes: parseInt(minutes),
      energyLevel: energy,
      priority,
      deadline: deadline || undefined,
      deadlineTime: deadlineTime || undefined,
      isMandatory,
    });

    setTitle("");
    setMinutes("");
    setEnergy("medium");
    setPriority("normal");
    setDeadline("");
    setDeadlineTime("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="rounded-xl bg-card border border-border p-4 space-y-3">
      {/* Title + Time row */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id="task-title-input"
          placeholder={isMandatory ? "Daily task name..." : "What needs doing?"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-surface border-border text-foreground placeholder:text-muted-foreground"
        />
        <Input
          id="task-time-input"
          type="number"
          min={5}
          step={5}
          placeholder="min"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 bg-surface border-border text-foreground placeholder:text-muted-foreground text-center"
        />
      </div>

      {/* Energy + Priority row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Energy tags */}
        <div className="flex gap-1.5">
          {(Object.keys(ENERGY_CONFIG) as EnergyLevel[]).map((level) => (
            <button
              key={level}
              id={`energy-${level}`}
              onClick={() => setEnergy(level)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                energy === level
                  ? "ring-1 ring-copper"
                  : "opacity-50 hover:opacity-75"
              }`}
              style={{
                backgroundColor:
                  energy === level
                    ? `color-mix(in oklch, ${ENERGY_CONFIG[level].color} 25%, transparent)`
                    : "var(--surface)",
                color:
                  energy === level
                    ? ENERGY_CONFIG[level].color
                    : "var(--muted-foreground)",
              }}
            >
              {ENERGY_CONFIG[level].emoji} {ENERGY_CONFIG[level].label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Priority tags */}
        <div className="flex gap-1.5">
          {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
            <button
              key={p}
              id={`priority-${p}`}
              onClick={() => setPriority(p)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                priority === p
                  ? "ring-1 ring-copper"
                  : "opacity-50 hover:opacity-75"
              }`}
              style={{
                backgroundColor:
                  priority === p ? "var(--accent)" : "var(--surface)",
                color:
                  priority === p
                    ? "var(--accent-foreground)"
                    : "var(--muted-foreground)",
              }}
            >
              {PRIORITY_CONFIG[p].emoji} {PRIORITY_CONFIG[p].label}
            </button>
          ))}
        </div>

        {/* Deadline date + time (not for mandatory) */}
        {!isMandatory && (
          <>
            <div className="w-px h-5 bg-border" />
            <div className="flex gap-1.5 items-center">
              <input
                type="date"
                id="task-deadline-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-surface border border-border rounded-md px-2 py-1 text-xs text-muted-foreground cursor-pointer"
              />
              <input
                type="time"
                id="task-deadline-time-input"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="bg-surface border border-border rounded-md px-2 py-1 text-xs text-muted-foreground cursor-pointer w-[90px]"
              />
            </div>
          </>
        )}

        {/* Add button */}
        <Button
          id="add-task-btn"
          onClick={handleSubmit}
          size="sm"
          className="ml-auto bg-copper text-copper-foreground hover:bg-copper/90 cursor-pointer"
        >
          {isMandatory ? "＋ Daily" : "＋ Add"}
        </Button>
      </div>
    </div>
  );
}
