import {
  Task,
  TimeBlock,
  DaySettings,
  EnergyLevel,
  Priority,
  WeekSchedules,
} from "./types";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function generateId(): string {
  return `tb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  important: 1,
  normal: 2,
};

const MAX_BLOCK = 90;
const BREAK_DURATION = 10;

/** Get Monday-based week dates */
export function getWeekDates(referenceDate: Date): Date[] {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

/** Format Date to "YYYY-MM-DD" */
export function dateToKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Structure a single day.
 * @param targetDate — "YYYY-MM-DD" to filter out tasks past their deadline
 */
export function structureDay(
  tasks: Task[],
  settings: DaySettings,
  targetDate?: string
): TimeBlock[] {
  let activeTasks = tasks.filter((t) => !t.isCompleted && !t.isDisabled);

  // Filter out tasks whose deadline is before the target date
  if (targetDate) {
    activeTasks = activeTasks.filter((t) => {
      if (!t.deadline) return true;
      return t.deadline >= targetDate;
    });
  }

  if (activeTasks.length === 0) return [];

  const startMin = timeToMinutes(settings.startTime);
  const endMin = timeToMinutes(settings.endTime);
  const totalMin = endMin - startMin;
  if (totalMin <= 0) return [];

  const groups: Record<EnergyLevel, Task[]> = { high: [], medium: [], low: [] };
  for (const task of activeTasks) {
    groups[task.energyLevel].push(task);
  }
  for (const key of Object.keys(groups) as EnergyLevel[]) {
    groups[key].sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    );
  }

  const morningEnd = startMin + Math.floor(totalMin * 0.4);
  const afternoonEnd = startMin + Math.floor(totalMin * 0.7);
  const zones: { energy: EnergyLevel; start: number; end: number }[] = [
    { energy: "high", start: startMin, end: morningEnd },
    { energy: "medium", start: morningEnd, end: afternoonEnd },
    { energy: "low", start: afternoonEnd, end: endMin },
  ];

  const blocks: TimeBlock[] = [];
  let cursor = startMin;

  for (const zone of zones) {
    const zoneTasks = groups[zone.energy];
    if (zoneTasks.length === 0) continue;
    if (cursor < zone.start) cursor = zone.start;

    for (const task of zoneTasks) {
      if (cursor >= endMin) break;
      let remaining = task.estimatedMinutes;

      while (remaining > 0 && cursor < endMin) {
        if (blocks.length > 0 && !blocks[blocks.length - 1].isBreak) {
          const breakEnd = Math.min(cursor + BREAK_DURATION, endMin);
          blocks.push({
            id: generateId(),
            taskId: null,
            taskTitle: "Break",
            startTime: minutesToTime(cursor),
            endTime: minutesToTime(breakEnd),
            durationMinutes: breakEnd - cursor,
            energyLevel: task.energyLevel,
            priority: "normal",
            isBreak: true,
            isCompleted: false,
            isMandatory: false,
          });
          cursor = breakEnd;
          if (cursor >= endMin) break;
        }

        let blockDuration = Math.min(remaining, MAX_BLOCK);
        blockDuration = Math.min(blockDuration, endMin - cursor);
        if (blockDuration <= 0) break;

        blocks.push({
          id: generateId(),
          taskId: task.id,
          taskTitle: task.title,
          startTime: minutesToTime(cursor),
          endTime: minutesToTime(cursor + blockDuration),
          durationMinutes: blockDuration,
          energyLevel: task.energyLevel,
          priority: task.priority,
          isBreak: false,
          isCompleted: false,
          isMandatory: task.isMandatory,
          originalEstimate: task.estimatedMinutes,
          deadline: task.deadline,
          deadlineTime: task.deadlineTime,
        });

        cursor += blockDuration;
        remaining -= blockDuration;
      }
    }
  }

  return blocks;
}

/**
 * Structure the week.
 * - Respects already-scheduled tasks (won't duplicate)
 * - Distributes backlog tasks evenly
 * - Adds mandatory tasks to every day
 * - Respects deadlines
 */
export function structureWeek(
  backlogTasks: Task[],
  mandatoryTasks: Task[],
  settings: DaySettings,
  weekDates: Date[],
  existingSchedules: WeekSchedules
): WeekSchedules {
  const schedules: WeekSchedules = {};
  const dateKeys = weekDates.map(dateToKey);

  const startMin = timeToMinutes(settings.startTime);
  const endMin = timeToMinutes(settings.endTime);
  const totalDayMin = endMin - startMin;
  const usableDayMin = Math.floor(totalDayMin * 0.82);

  // Collect task IDs already scheduled in existing schedules
  const alreadyScheduledIds = new Set<string>();
  for (const key of dateKeys) {
    const existing = existingSchedules[key] || [];
    for (const block of existing) {
      if (block.taskId && !block.isBreak && !block.isMandatory) {
        alreadyScheduledIds.add(block.taskId);
      }
    }
  }

  const dayLoad: Record<string, number> = {};
  const dayTasks: Record<string, Task[]> = {};

  for (const key of dateKeys) {
    dayLoad[key] = 0;
    // Mandatory tasks for each day
    dayTasks[key] = mandatoryTasks
      .filter((t) => !t.isCompleted && !t.isDisabled)
      .map((t) => ({ ...t }));
    dayLoad[key] = dayTasks[key].reduce(
      (sum, t) => sum + t.estimatedMinutes,
      0
    );

    // Account for existing load from manually placed tasks
    const existing = existingSchedules[key] || [];
    for (const block of existing) {
      if (!block.isBreak && !block.isMandatory && block.taskId) {
        dayLoad[key] += block.durationMinutes;
      }
    }
  }

  // Only distribute tasks that are NOT already scheduled
  const activeTasks = backlogTasks.filter(
    (t) => !t.isCompleted && !alreadyScheduledIds.has(t.id)
  );

  const withDeadline: Task[] = [];
  const withoutDeadline: Task[] = [];
  for (const task of activeTasks) {
    if (task.deadline) withDeadline.push(task);
    else withoutDeadline.push(task);
  }

  withDeadline.sort((a, b) => {
    if (a.deadline !== b.deadline) return a.deadline!.localeCompare(b.deadline!);
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });
  withoutDeadline.sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  for (const task of withDeadline) {
    const deadlineKey = task.deadline!;
    let eligibleDays = dateKeys.filter((key) => key <= deadlineKey);
    if (eligibleDays.length === 0) eligibleDays = [dateKeys[0]];
    eligibleDays.sort((a, b) => dayLoad[a] - dayLoad[b]);

    let placed = false;
    for (const dayKey of eligibleDays) {
      if (dayLoad[dayKey] + task.estimatedMinutes <= usableDayMin) {
        dayTasks[dayKey].push(task);
        dayLoad[dayKey] += task.estimatedMinutes;
        placed = true;
        break;
      }
    }
    if (!placed && eligibleDays.length > 0) {
      dayTasks[eligibleDays[0]].push(task);
      dayLoad[eligibleDays[0]] += task.estimatedMinutes;
    }
  }

  for (const task of withoutDeadline) {
    const sortedDays = [...dateKeys].sort((a, b) => dayLoad[a] - dayLoad[b]);
    dayTasks[sortedDays[0]].push(task);
    dayLoad[sortedDays[0]] += task.estimatedMinutes;
  }

  for (const key of dateKeys) {
    schedules[key] = structureDay(dayTasks[key], settings, key);
  }

  return schedules;
}

/** Reconstruct a Task from a TimeBlock (for returning to backlog) */
export function blockToTask(
  block: TimeBlock,
  allBlocksForTask: TimeBlock[]
): Task {
  return {
    id: block.taskId || generateId(),
    title: block.taskTitle,
    estimatedMinutes:
      block.originalEstimate ||
      allBlocksForTask.reduce((sum, b) => sum + b.durationMinutes, 0),
    energyLevel: block.energyLevel,
    priority: block.priority,
    deadline: block.deadline,
    deadlineTime: block.deadlineTime,
    isMandatory: false,
    isCompleted: false,
    order: 0,
  };
}
