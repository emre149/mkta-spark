"use client";

import { useState } from "react";
import { WeeklyTopic } from "@/lib/types";

interface WeeklyTopicsProps {
  topics: WeeklyTopic[];
  onAddTopic: (topic: string, notes: string) => void;
  onRemoveTopic: (id: string) => void;
  weekKey: string;
}

export function WeeklyTopics({
  topics,
  onAddTopic,
  onRemoveTopic,
}: WeeklyTopicsProps) {
  const [newTopic, setNewTopic] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (!newTopic.trim()) return;
    onAddTopic(newTopic.trim(), "");
    setNewTopic("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-semibold text-foreground/90"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          📝 This Week&apos;s Topics
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-[11px] text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors"
        >
          {isAdding ? "Cancel" : "+ Add"}
        </button>
      </div>

      {isAdding && (
        <div className="flex gap-2 animate-slide-in-up">
          <input
            className="input-dark flex-1 !py-2 !text-xs"
            placeholder="What's the topic?"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <button
            onClick={handleAdd}
            className="btn-primary px-3 py-2 rounded-lg text-xs font-medium cursor-pointer"
          >
            Add
          </button>
        </div>
      )}

      {topics.length === 0 && !isAdding ? (
        <div className="py-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            No topics yet — add what you want to talk about this week.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {topics.map((topic, i) => (
            <div
              key={topic.id}
              className={`group flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-surface/50 transition-colors animate-slide-in-up stagger-${Math.min(
                i + 1,
                5
              )}`}
            >
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{
                background: `oklch(0.7 0.18 ${280 + i * 30})`
              }} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground/85 leading-tight">
                  {topic.topic}
                </p>
                {topic.notes && (
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-relaxed">
                    {topic.notes}
                  </p>
                )}
              </div>
              <button
                onClick={() => onRemoveTopic(topic.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive text-xs cursor-pointer transition-opacity shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
