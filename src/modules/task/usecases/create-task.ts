import { type SQLiteDatabase } from 'expo-sqlite';

import { type ReminderInput } from '@/modules/reminder/domain/reminder.types';
import { syncTaskNotifications } from '@/modules/notification/usecases/sync-task-notifications';
import { SQLiteReminderRepository } from '@/modules/reminder/repository/sqlite-reminder.repository';
import { type TaskMutationInput } from '@/modules/task/domain/task-detail.types';
import { SQLiteSubTaskRepository } from '@/modules/subtask/repository/sqlite-subtask.repository';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';
import { parseReminderInput } from '@/shared/utils/datetime';

export async function createTask(database: SQLiteDatabase, input: TaskMutationInput) {
  const taskRepository = new SQLiteTaskRepository(database);
  const subTaskRepository = new SQLiteSubTaskRepository(database);
  const reminderRepository = new SQLiteReminderRepository(database);

  let createdTaskId = '';

  await database.withTransactionAsync(async () => {
    createdTaskId = await taskRepository.createTask(input);
    await subTaskRepository.replaceSubTasks(createdTaskId, input.subTaskTitles);
    await reminderRepository.replaceTaskReminders(createdTaskId, mapReminderInputs(input.reminders));
  });

  await syncTaskNotifications(database, createdTaskId);

  return createdTaskId;
}

function mapReminderInputs(reminders: string[]): ReminderInput[] {
  return reminders
    .map((reminder) => parseReminderInput(reminder))
    .filter((reminderAt): reminderAt is string => Boolean(reminderAt))
    .map((remindAt) => ({
      remindAt,
      reminderType: 'normal' as const,
    }));
}
