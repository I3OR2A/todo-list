import { type SQLiteDatabase } from 'expo-sqlite';

import { cancelTaskNotifications } from '@/modules/notification/usecases/cancel-task-notifications';
import { SQLiteReminderRepository } from '@/modules/reminder/repository/sqlite-reminder.repository';
import { SQLiteSubTaskRepository } from '@/modules/subtask/repository/sqlite-subtask.repository';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function permanentlyDeleteTask(database: SQLiteDatabase, taskId: string) {
  const taskRepository = new SQLiteTaskRepository(database);
  const subTaskRepository = new SQLiteSubTaskRepository(database);
  const reminderRepository = new SQLiteReminderRepository(database);

  await cancelTaskNotifications(database, taskId);

  await database.withTransactionAsync(async () => {
    await reminderRepository.deleteByTaskId(taskId);
    await subTaskRepository.replaceSubTasks(taskId, []);
    await taskRepository.permanentlyDeleteTask(taskId);
  });
}
