import type { ProjectConfigPayload } from "./ai-analysis-service";
import { triggerIngestion } from "./trigger-ingestion-service";

export interface SchedulerState {
  projectId: string;
  config: ProjectConfigPayload;
  startTime: string;
  endTime: string | null;
  days: number;
  createdAt: string;
  lastTriggered: string | null;
  triggerCount: number;
  isActive: boolean;
}

const SCHEDULER_STORAGE_KEY = "naradai_schedulers";

function getSchedulerId(config: ProjectConfigPayload): string {
  return `scheduler_${config.project.project_name}_${Date.now()}`;
}

function parseTime(timeString: string): { hour: number; minute: number } {
  const match = timeString.match(/T(\d{2}):(\d{2})/);
  if (!match) {
    throw new Error(`Invalid time format: ${timeString}`);
  }
  return {
    hour: parseInt(match[1], 10),
    minute: parseInt(match[2], 10),
  };
}

function getNextTriggerTime(
  startTime: string,
  days: number,
  createdAt: string
): Date | null {
  const { hour, minute } = parseTime(startTime);
  const created = new Date(createdAt);
  const now = new Date();

  for (let day = 0; day < days; day++) {
    const triggerDate = new Date(created);
    triggerDate.setDate(created.getDate() + day);
    triggerDate.setHours(hour, minute, 0, 0);

    if (triggerDate > now) {
      return triggerDate;
    }
  }

  return null;
}

function calculateEndTime(startTime: string, days: number): Date {
  const start = new Date(startTime);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return end;
}

export function saveScheduler(config: ProjectConfigPayload): string {
  const schedulerId = getSchedulerId(config);
  const createdAt = new Date().toISOString();
  const endTime = config.schedule.end_time
    ? new Date(config.schedule.end_time).toISOString()
    : calculateEndTime(config.schedule.start_time, config.schedule.backfill.days).toISOString();

  const schedulerState: SchedulerState = {
    projectId: schedulerId,
    config,
    startTime: config.schedule.start_time,
    endTime,
    days: config.schedule.backfill.days,
    createdAt,
    lastTriggered: null,
    triggerCount: 0,
    isActive: true,
  };

  const schedulers = getAllSchedulers();
  schedulers[schedulerId] = schedulerState;
  localStorage.setItem(SCHEDULER_STORAGE_KEY, JSON.stringify(schedulers));

  setupSchedulerCheck(schedulerId);

  return schedulerId;
}

export function getAllSchedulers(): Record<string, SchedulerState> {
  const stored = localStorage.getItem(SCHEDULER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function getScheduler(schedulerId: string): SchedulerState | null {
  const schedulers = getAllSchedulers();
  return schedulers[schedulerId] || null;
}

export function updateScheduler(
  schedulerId: string,
  updates: Partial<SchedulerState>
): void {
  const schedulers = getAllSchedulers();
  if (schedulers[schedulerId]) {
    schedulers[schedulerId] = { ...schedulers[schedulerId], ...updates };
    localStorage.setItem(SCHEDULER_STORAGE_KEY, JSON.stringify(schedulers));
  }
}

export function deleteScheduler(schedulerId: string): void {
  const schedulers = getAllSchedulers();
  delete schedulers[schedulerId];
  localStorage.setItem(SCHEDULER_STORAGE_KEY, JSON.stringify(schedulers));
}

let checkInterval: number | null = null;

function setupSchedulerCheck(schedulerId: string): void {
  if (checkInterval !== null) {
    checkAndTriggerSchedulers();
    return;
  }

  checkInterval = window.setInterval(() => {
    checkAndTriggerSchedulers();
  }, 1000);

  checkAndTriggerSchedulers();
}

function checkAndTriggerSchedulers(): void {
  const schedulers = getAllSchedulers();
  const now = new Date();

  Object.values(schedulers).forEach((scheduler) => {
    if (!scheduler.isActive) {
      return;
    }

    const endTime = scheduler.endTime ? new Date(scheduler.endTime) : null;
    if (endTime && now > endTime) {
      updateScheduler(scheduler.projectId, { isActive: false });
      return;
    }

    const { hour, minute } = parseTime(scheduler.startTime);
    const created = new Date(scheduler.createdAt);
    const daysSinceStart = Math.floor(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceStart >= scheduler.days) {
      updateScheduler(scheduler.projectId, { isActive: false });
      return;
    }

    const lastTriggered = scheduler.lastTriggered
      ? new Date(scheduler.lastTriggered)
      : null;

    const isTriggerTime = now.getHours() === hour && now.getMinutes() === minute && now.getSeconds() === 0;
    const notTriggeredToday = !lastTriggered || lastTriggered.toDateString() !== now.toDateString();
    const withinDaysLimit = daysSinceStart < scheduler.days;

    if (isTriggerTime && notTriggeredToday && withinDaysLimit) {
      triggerScheduler(scheduler.projectId);
    }
  });
}

async function triggerScheduler(schedulerId: string): Promise<void> {
  const scheduler = getScheduler(schedulerId);
  if (!scheduler || !scheduler.isActive) {
    return;
  }

  try {
    await triggerIngestion(scheduler.config);
    const now = new Date().toISOString();
    updateScheduler(schedulerId, {
      lastTriggered: now,
      triggerCount: scheduler.triggerCount + 1,
    });
    console.log(`Scheduler ${schedulerId} triggered successfully at ${now}`);
  } catch (error) {
    console.error(`Failed to trigger scheduler ${schedulerId}:`, error);
  }
}

export function initializeSchedulers(): void {
  const schedulers = getAllSchedulers();
  Object.keys(schedulers).forEach((schedulerId) => {
    const scheduler = schedulers[schedulerId];
    if (scheduler.isActive) {
      setupSchedulerCheck(schedulerId);
    }
  });
}
