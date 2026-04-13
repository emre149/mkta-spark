"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";

interface BacklogListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (tasks: Task[]) => void;
}

export function BacklogList({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
}: BacklogListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => target.classList.add("dragging"), 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (id: string) => {
    setDragOverId(id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    // Remove visual feedback from all cards
    document.querySelectorAll(".dragging").forEach((el) => {
      el.classList.remove("dragging");
    });
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const newTasks = [...tasks];
    const draggedIdx = newTasks.findIndex((t) => t.id === draggedId);
    const targetIdx = newTasks.findIndex((t) => t.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const [removed] = newTasks.splice(draggedIdx, 1);
    newTasks.splice(targetIdx, 0, removed);

    // Update order property
    const reordered = newTasks.map((t, i) => ({ ...t, order: i }));
    onReorderTasks(reordered);

    setDraggedId(null);
    setDragOverId(null);
  };

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3 opacity-40">📋</div>
        <p className="text-sm text-muted-foreground">
          No tasks yet. Add something above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2" onDragEnd={handleDragEnd}>
      {activeTasks.map((task, i) => (
        <div
          key={task.id}
          className={`animate-slide-in-up stagger-${Math.min(i + 1, 10)} ${
            dragOverId === task.id ? "drag-over rounded-lg" : ""
          }`}
          onDragEnter={() => handleDragEnter(task.id)}
        >
          <TaskCard
            task={task}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        </div>
      ))}

      {completedTasks.length > 0 && (
        <div className="pt-3 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">
            Completed ({completedTasks.length})
          </p>
          <div className="space-y-1.5">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
