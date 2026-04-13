"use client";

import { useState } from "react";
import { Task, ENERGY_CONFIG, PRIORITY_CONFIG } from "@/lib/types";
import { Input } from "@/components/ui/input";

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
}

export function TaskCard({
  task,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editMinutes, setEditMinutes] = useState(
    task.estimatedMinutes.toString()
  );
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onUpdate({ ...task, isCompleted: !task.isCompleted });
      setIsCompleting(false);
    }, 400);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && parseInt(editMinutes) > 0) {
      onUpdate({
        ...task,
        title: editTitle.trim(),
        estimatedMinutes: parseInt(editMinutes),
      });
    }
    setIsEditing(false);
  };

  const energyConf = ENERGY_CONFIG[task.energyLevel];
  const priorityConf = PRIORITY_CONFIG[task.priority];

  // Format deadline display + overdue check
  const todayKey = new Date().toISOString().split("T")[0];
  const isOverdue = task.deadline ? task.deadline < todayKey : false;

  const deadlineDisplay = (() => {
    if (!task.deadline) return null;
    const dateStr = new Date(task.deadline + "T00:00:00").toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    );
    if (task.deadlineTime) {
      return `${dateStr} · ${task.deadlineTime}`;
    }
    return dateStr;
  })();

  return (
    <div
      id={`task-card-${task.id}`}
      draggable={!isEditing}
      onDragStart={(e) => onDragStart?.(e, task.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e);
      }}
      onDrop={(e) => onDrop?.(e, task.id)}
      className={`
        group relative rounded-lg border border-border bg-card p-3 card-lift cursor-grab
        ${isCompleting ? "animate-task-complete" : ""}
        ${task.isCompleted ? "task-completed" : ""}
        ${task.isMandatory ? "border-l-2" : ""}
      `}
      style={
        task.isMandatory
          ? { borderLeftColor: "var(--copper)" }
          : undefined
      }
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          id={`complete-${task.id}`}
          onClick={handleComplete}
          className={`
            mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center
            transition-all cursor-pointer shrink-0
            ${
              task.isCompleted
                ? "bg-copper border-copper"
                : "border-muted-foreground/40 hover:border-copper"
            }
          `}
        >
          {task.isCompleted && (
            <svg
              width="10"
              height="8"
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

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                className="h-7 text-sm bg-surface border-border"
                autoFocus
              />
              <Input
                type="number"
                value={editMinutes}
                onChange={(e) => setEditMinutes(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                className="h-7 w-16 text-sm bg-surface border-border text-center"
              />
              <button
                onClick={handleSaveEdit}
                className="text-xs text-copper hover:text-copper/80 cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium leading-tight ${
                    task.isCompleted ? "line-through opacity-50" : ""
                  }`}
                >
                  {task.isMandatory && (
                    <span className="mr-1 opacity-60">🔁</span>
                  )}
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {/* Time */}
                <span className="text-[11px] text-muted-foreground font-medium">
                  {task.estimatedMinutes}m
                </span>
                {/* Energy badge — boosted */}
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded font-semibold"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${energyConf.color} 20%, transparent)`,
                    color: energyConf.color,
                  }}
                >
                  {energyConf.emoji} {energyConf.label}
                </span>
                {/* Priority — larger dot */}
                <span className="text-xs leading-none">
                  {priorityConf.emoji}
                </span>
                {/* Deadline with optional time */}
                {deadlineDisplay && (
                  <span
                    className={`text-[11px] font-medium ${
                      isOverdue
                        ? "deadline-overdue"
                        : "text-muted-foreground"
                    }`}
                  >
                    📅 {deadlineDisplay}{isOverdue ? " ⚠" : ""}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Actions (visible on hover) */}
        {!isEditing && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              id={`edit-${task.id}`}
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-surface text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Edit"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              id={`delete-${task.id}`}
              onClick={() => onDelete(task.id)}
              className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              title="Delete"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
