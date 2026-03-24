import { type RecurrenceType } from '@/modules/task/domain/task.types';

export function formatRecurrenceLabel(
  recurrenceType: RecurrenceType | null | undefined,
  recurrenceInterval: number | null | undefined
) {
  switch (recurrenceType) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    case 'yearly':
      return 'Yearly';
    case 'custom_days':
      return `Every ${recurrenceInterval ?? 1} day${(recurrenceInterval ?? 1) === 1 ? '' : 's'}`;
    case 'custom_weeks':
      return `Every ${recurrenceInterval ?? 1} week${(recurrenceInterval ?? 1) === 1 ? '' : 's'}`;
    default:
      return 'No recurrence';
  }
}

export function buildCompletionFeedback(input: {
  nextRecurringTaskId: string | null;
  wasRecurring: boolean;
}) {
  if (input.nextRecurringTaskId) {
    return 'Recurring task completed. The next instance was created.';
  }

  if (input.wasRecurring) {
    return 'Recurring task completed.';
  }

  return 'Task completed.';
}
