import { type SQLiteDatabase } from 'expo-sqlite';

import { syncOverdueTaskNotifications } from '@/modules/notification/usecases/sync-overdue-task-notifications';
import { syncTaskNotifications } from '@/modules/notification/usecases/sync-task-notifications';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function rescheduleAllTaskNotifications(database: SQLiteDatabase) {
  const taskRepository = new SQLiteTaskRepository(database);
  const [activeTasks, overdueTasks] = await Promise.all([
    taskRepository.getTasksByStatus('active'),
    taskRepository.getTasksByStatus('overdue'),
  ]);

  for (const task of [...activeTasks, ...overdueTasks]) {
    await syncTaskNotifications(database, task.id);
  }

  await syncOverdueTaskNotifications(database);
}
