import { type SQLiteDatabase } from 'expo-sqlite';

import { SQLiteReminderRepository } from '@/modules/reminder/repository/sqlite-reminder.repository';
import { SQLiteSubTaskRepository } from '@/modules/subtask/repository/sqlite-subtask.repository';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

export async function cleanupTrash(database: SQLiteDatabase, referenceAt = new Date()) {
  const taskRepository = new SQLiteTaskRepository(database);
  const subTaskRepository = new SQLiteSubTaskRepository(database);
  const reminderRepository = new SQLiteReminderRepository(database);
  const cutoffDate = new Date(referenceAt.getTime() - THIRTY_DAYS_IN_MS).toISOString();
  const expiredTasks = await taskRepository.getExpiredTrashTasks(cutoffDate);

  if (expiredTasks.length === 0) {
    return;
  }

  await database.withTransactionAsync(async () => {
    for (const task of expiredTasks) {
      await reminderRepository.deleteByTaskId(task.id);
      await subTaskRepository.replaceSubTasks(task.id, []);
      await taskRepository.permanentlyDeleteTask(task.id);
    }
  });
}
