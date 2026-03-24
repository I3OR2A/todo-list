import { type SQLiteDatabase } from 'expo-sqlite';

import { cancelTaskNotifications } from '@/modules/notification/usecases/cancel-task-notifications';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function moveTaskToTrash(database: SQLiteDatabase, taskId: string) {
  const taskRepository = new SQLiteTaskRepository(database);
  await taskRepository.moveTaskToTrash(taskId);
  await cancelTaskNotifications(database, taskId);
}
