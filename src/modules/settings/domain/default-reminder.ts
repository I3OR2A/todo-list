import { formatTaskDateTime } from '@/shared/utils/datetime';

export interface DefaultReminderSetting {
  minutesBefore: number;
}

export const DEFAULT_REMINDER_OPTIONS: DefaultReminderSetting[] = [
  { minutesBefore: 15 },
  { minutesBefore: 30 },
  { minutesBefore: 60 },
];

export function parseDefaultReminderJson(
  value: string | null | undefined
): DefaultReminderSetting | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<DefaultReminderSetting>;
    if (
      typeof parsed.minutesBefore !== 'number' ||
      !Number.isFinite(parsed.minutesBefore) ||
      parsed.minutesBefore <= 0
    ) {
      return null;
    }

    return { minutesBefore: parsed.minutesBefore };
  } catch {
    return null;
  }
}

export function serializeDefaultReminder(
  value: DefaultReminderSetting | null
): string | null {
  if (!value) {
    return null;
  }

  return JSON.stringify(value);
}

export function buildDefaultReminderValue(
  dueAt: string,
  setting: DefaultReminderSetting | null
) {
  if (!setting) {
    return null;
  }

  const dueDate = new Date(dueAt);

  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  const reminderDate = new Date(dueDate.getTime() - setting.minutesBefore * 60 * 1000);
  return formatTaskDateTime(reminderDate.toISOString());
}
