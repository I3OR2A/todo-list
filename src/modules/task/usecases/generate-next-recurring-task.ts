import { type SQLiteDatabase } from 'expo-sqlite';

import { SQLiteReminderRepository } from '@/modules/reminder/repository/sqlite-reminder.repository';
import { SQLiteSubTaskRepository } from '@/modules/subtask/repository/sqlite-subtask.repository';
import { type RecurrenceType } from '@/modules/task/domain/task.types';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function generateNextRecurringTask(database: SQLiteDatabase, taskId: string) {
  const taskRepository = new SQLiteTaskRepository(database);
  const subTaskRepository = new SQLiteSubTaskRepository(database);
  const reminderRepository = new SQLiteReminderRepository(database);
  const sourceTask = await taskRepository.getTaskById(taskId);

  if (
    !sourceTask ||
    !sourceTask.isRecurring ||
    !sourceTask.recurrenceType
  ) {
    return null;
  }

  const nextDueAt = calculateNextDueAt(
    sourceTask.dueAt,
    sourceTask.recurrenceType,
    sourceTask.recurrenceInterval ?? 1
  );
  const sourceSubTasks = await subTaskRepository.listByTaskId(taskId);
  const sourceReminders = await reminderRepository.listByTaskId(taskId);

  const nextTaskId = await taskRepository.createTask({
    title: sourceTask.title,
    note: sourceTask.note,
    dueAt: nextDueAt,
    categoryId: sourceTask.categoryId ?? null,
    priority: sourceTask.priority,
    isRecurring: true,
    recurrenceType: sourceTask.recurrenceType,
    recurrenceInterval: sourceTask.recurrenceInterval ?? null,
    recurrenceGenerateMode: sourceTask.recurrenceGenerateMode ?? 'after_completion',
    parentTaskId: sourceTask.id,
  });

  await subTaskRepository.replaceSubTasks(
    nextTaskId,
    sourceSubTasks.map((subTask) => subTask.title)
  );

  await reminderRepository.replaceTaskReminders(
    nextTaskId,
    sourceReminders
      .filter((reminder) => reminder.reminderType === 'normal')
      .map((reminder) => ({
      remindAt: shiftReminder(reminder.remindAt, sourceTask.dueAt, nextDueAt),
      reminderType: reminder.reminderType,
    }))
  );

  return nextTaskId;
}

export function calculateNextDueAt(
  dueAt: string,
  recurrenceType: RecurrenceType,
  recurrenceInterval: number
) {
  const date = new Date(dueAt);

  switch (recurrenceType) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'custom_days':
      date.setDate(date.getDate() + recurrenceInterval);
      break;
    case 'custom_weeks':
      date.setDate(date.getDate() + recurrenceInterval * 7);
      break;
  }

  return date.toISOString();
}

export function shiftReminder(remindAt: string, sourceDueAt: string, nextDueAt: string) {
  const delta = new Date(remindAt).getTime() - new Date(sourceDueAt).getTime();
  return new Date(new Date(nextDueAt).getTime() + delta).toISOString();
}
