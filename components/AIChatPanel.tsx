"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Task,
  TimeBlock,
  DaySettings,
  WeekSchedules,
  ChatMessage,
  AIScheduleAction,
  ENERGY_CONFIG,
} from "@/lib/types";
import { dateToKey } from "@/lib/structureEngine";

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  backlogTasks: Task[];
  mandatoryTasks: Task[];
  weekSchedules: WeekSchedules;
  daySettings: DaySettings;
  weekDates: Date[];
  onApplySchedule: (schedule: AIScheduleAction) => void;
  prefillMessage?: string | null;
  onPrefillConsumed?: () => void;
}

const SYSTEM_PROMPT = `You are the AI assistant inside Cockpit, a personal daily planning tool. You help the user organize their day and week effectively.

You have access to the user's current data:
- Their task backlog (all unscheduled tasks with title, duration, energy, priority, deadline)
- Their daily rituals (mandatory recurring tasks)
- Their weekly schedule (what's scheduled on each day)
- Their work window (start and end time)

When the user asks you to structure their day or week, respond with a JSON block wrapped in \`\`\`json\`\`\` tags containing the schedule. The app will parse this and apply it.

JSON format for scheduling:
{
  "action": "structure_day" | "structure_week",
  "schedule": {
    "monday": [
      {"task_id": "xxx", "start_time": "10:30", "end_time": "11:15"},
      ...
    ],
    ...
  }
}

When the user just chats (asks questions, wants advice), respond normally in text.

Be direct, concise, and practical. No fluff. The user prefers short, actionable responses.`;

function generateMsgId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function parseAIResponse(content: string): {
  text: string;
  schedule?: AIScheduleAction;
} {
  const jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.action && parsed.schedule) {
        const textParts = content.split(/```json[\s\S]*?```/);
        const text = textParts.map((p) => p.trim()).filter(Boolean).join("\n\n");
        return { text, schedule: parsed as AIScheduleAction };
      }
    } catch {
      // not valid JSON, return as text
    }
  }
  return { text: content };
}

export function AIChatPanel({
  isOpen,
  onClose,
  apiKey,
  backlogTasks,
  mandatoryTasks,
  weekSchedules,
  daySettings,
  weekDates,
  onApplySchedule,
  prefillMessage,
  onPrefillConsumed,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefillProcessed = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Handle prefill message
  useEffect(() => {
    if (prefillMessage && isOpen && !prefillProcessed.current) {
      prefillProcessed.current = true;
      sendMessage(prefillMessage);
      onPrefillConsumed?.();
    }
  }, [prefillMessage, isOpen]);

  // Reset prefill tracking when panel closes
  useEffect(() => {
    if (!isOpen) {
      prefillProcessed.current = false;
    }
  }, [isOpen]);

  const buildContext = useCallback(() => {
    const ctx: Record<string, unknown> = {
      backlog: backlogTasks.map((t) => ({
        id: t.id,
        title: t.title,
        duration_min: t.estimatedMinutes,
        energy: t.energyLevel,
        priority: t.priority,
        deadline: t.deadline || null,
        deadline_time: t.deadlineTime || null,
      })),
      rituals: mandatoryTasks
        .filter((t) => !t.isDisabled)
        .map((t) => ({
          id: t.id,
          title: t.title,
          duration_min: t.estimatedMinutes,
          energy: t.energyLevel,
        })),
      work_window: {
        start: daySettings.startTime,
        end: daySettings.endTime,
      },
      week: {} as Record<string, unknown>,
    };

    const dayNames = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    for (let i = 0; i < weekDates.length; i++) {
      const key = dateToKey(weekDates[i]);
      const blocks = weekSchedules[key] || [];
      (ctx.week as Record<string, unknown>)[dayNames[i]] = {
        date: key,
        blocks: blocks
          .filter((b) => !b.isBreak)
          .map((b) => ({
            task_id: b.taskId,
            title: b.taskTitle,
            start: b.startTime,
            end: b.endTime,
            done: b.isCompleted,
            mandatory: b.isMandatory,
          })),
      };
    }

    return ctx;
  }, [backlogTasks, mandatoryTasks, weekSchedules, daySettings, weekDates]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: generateMsgId(),
        role: "user",
        content: text.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const context = buildContext();
        const allMessages = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          {
            role: "user" as const,
            content: `Current context:\n${JSON.stringify(context, null, 2)}\n\nUser message: ${text.trim()}`,
          },
        ];

        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1500,
            system: SYSTEM_PROMPT,
            messages: allMessages,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData?.error?.message || `API error (${res.status})`
          );
        }

        const data = await res.json();
        const aiContent =
          data.content?.[0]?.text || "Sorry, I got an empty response.";
        const parsed = parseAIResponse(aiContent);

        const aiMsg: ChatMessage = {
          id: generateMsgId(),
          role: "assistant",
          content: parsed.text || aiContent,
          schedule: parsed.schedule,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (e: unknown) {
        const errorMessage =
          e instanceof Error ? e.message : "Unknown error occurred";
        const errMsg: ChatMessage = {
          id: generateMsgId(),
          role: "assistant",
          content: `⚠️ Error: ${errorMessage}`,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, messages, buildContext]
  );

  const handleApply = (msg: ChatMessage) => {
    if (msg.schedule) {
      onApplySchedule(msg.schedule);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, scheduleApplied: true } : m
        )
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-panel animate-slide-up-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            💬 AI Assistant
          </span>
          {!apiKey && (
            <span className="text-[10px] text-muted-foreground bg-surface px-2 py-0.5 rounded-full">
              No API key
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-lg"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {!apiKey && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Add your Claude API key in{" "}
              <span className="text-copper font-medium">Settings (⚙️)</span> to
              use AI features.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3.5 py-2.5 ${
                msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
              }`}
            >
              <p className="text-[13px] text-foreground whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>

              {/* Schedule preview */}
              {msg.schedule && !msg.scheduleApplied && (
                <div className="mt-2.5 pt-2 border-t border-border/30 space-y-2">
                  <p className="text-[11px] text-copper font-semibold">
                    📋 AI suggests a schedule
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApply(msg)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-copper text-copper-foreground cursor-pointer hover:bg-copper/90 transition-colors"
                    >
                      Apply ✓
                    </button>
                    <button
                      onClick={() =>
                        setMessages((prev) =>
                          prev.map((m) =>
                            m.id === msg.id
                              ? { ...m, scheduleApplied: true }
                              : m
                          )
                        )
                      }
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-surface text-muted-foreground border border-border cursor-pointer hover:text-foreground transition-colors"
                    >
                      Dismiss ✗
                    </button>
                  </div>
                </div>
              )}

              {msg.scheduleApplied && msg.schedule && (
                <p className="text-[10px] text-copper/60 mt-1.5">
                  ✓ Schedule applied
                </p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai px-4 py-3 flex gap-1.5">
              <div className="thinking-dot" />
              <div className="thinking-dot" />
              <div className="thinking-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border/40 shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={
              apiKey
                ? "Ask AI to structure your day, suggest priorities..."
                : "Set API key in ⚙️ Settings first"
            }
            disabled={!apiKey}
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 disabled:opacity-40"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!apiKey || !input.trim() || isLoading}
            className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-copper text-copper-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
