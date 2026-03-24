import { type TaskFormErrors } from '@/modules/task/domain/task-detail.types';
import { combineDateAndTime, parseReminderInput } from '@/shared/utils/datetime';

export function validateTaskDraft(input: {
  title: string;
  dueDate: string;
  dueTime: string;
  recurrenceInterval: string;
  recurrenceType: string | null;
  reminderValues: string[];
}): TaskFormErrors {
  const errors: TaskFormErrors = {};

  if (!input.title.trim()) {
    errors.title = 'Please enter a task title.';
  }

  if (!input.dueDate.trim()) {
    errors.dueDate = 'Please set a due date.';
  }

  if (!input.dueTime.trim()) {
    errors.dueTime = 'Please set a due time.';
  }

  if (input.dueDate.trim() && input.dueTime.trim()) {
    const dueAt = combineDateAndTime(input.dueDate, input.dueTime);
    if (!dueAt) {
      errors.form = 'Due date and time must be valid.';
    }
  }

  if (
    (input.recurrenceType === 'custom_days' || input.recurrenceType === 'custom_weeks') &&
    (!input.recurrenceInterval.trim() || Number(input.recurrenceInterval) < 1)
  ) {
    errors.recurrenceInterval = 'Custom recurrence interval must be greater than 0.';
  }

  const reminderErrors: Record<number, string> = {};

  input.reminderValues.forEach((reminderValue, index) => {
    if (!reminderValue.trim()) {
      return;
    }

    if (!parseReminderInput(reminderValue)) {
      reminderErrors[index] = 'Use YYYY-MM-DD HH:mm.';
    }
  });

  if (Object.keys(reminderErrors).length > 0) {
    errors.reminders = reminderErrors;
  }

  return errors;
}
