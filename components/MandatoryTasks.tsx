"use client";

import { Task, ENERGY_CONFIG } from "@/lib/types";
import { TaskInput } from "./TaskInput";

interface MandatoryTasksProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "isCompleted" | "order">) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function MandatoryTasks({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: MandatoryTasksProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground/90">
          🔁 Daily Rituals
        </span>
        <span className="text-[10px] text-muted-foreground bg-surface px-2 py-0.5 rounded-full font-medium">
          Every day
        </span>
      </div>

      {tasks.length > 0 && (
        <div className="space-y-1.5">
          {tasks.map((task) => {
            const energyConf = ENERGY_CONFIG[task.energyLevel];
            return (
              <div
                key={task.id}
                className={`group flex items-center gap-2.5 rounded-lg border p-2.5 transition-all ${
                  task.isDisabled
                    ? "border-border/30 opacity-40"
                    : "border-border bg-card"
                }`}
                style={
                  !task.isDisabled
                    ? { borderLeftWidth: "2px", borderLeftColor: "var(--copper)" }
                    : undefined
                }
              >
                {/* Toggle on/off */}
                <button
                  onClick={() =>
                    onUpdateTask({ ...task, isDisabled: !task.isDisabled })
                  }
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                    task.isDisabled
                      ? "border-muted-foreground/30 bg-transparent"
                      : "border-copper bg-copper/20"
                  }`}
                  title={task.isDisabled ? "Enable" : "Disable temporarily"}
                >
                  {!task.isDisabled && (
                    <svg
                      width="8"
                      height="6"
                      viewBox="0 0 8 6"
                      fill="none"
                      className="text-copper"
                    >
                      <path
                        d="M1 3L3 5L7 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[12px] font-medium leading-tight ${
                      task.isDisabled
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      {task.estimatedMinutes}m
                    </span>
                    <span
                      className="text-[9px] px-1 py-0.5 rounded font-semibold"
                      style={{
                        backgroundColor: `color-mix(in oklch, ${energyConf.color} 15%, transparent)`,
                        color: task.isDisabled
                          ? "var(--muted-foreground)"
                          : energyConf.color,
                      }}
                    >
                      {energyConf.emoji}
                    </span>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <TaskInput onAddTask={onAddTask} isMandatory={true} />
    </div>
  );
}
