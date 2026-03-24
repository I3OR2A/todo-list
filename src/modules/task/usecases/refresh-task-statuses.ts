import { type SQLiteDatabase } from 'expo-sqlite';

import { syncOverdueTaskNotifications } from '@/modules/notification/usecases/sync-overdue-task-notifications';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';
import { catchUpRecurringTasks } from '@/modules/task/usecases/catch-up-recurring-tasks';

export async function refreshTaskStatuses(database: SQLiteDatabase, referenceAt = new Date().toISOString()) {
  const taskRepository = new SQLiteTaskRepository(database);
  await catchUpRecurringTasks(database, referenceAt);
  await taskRepository.refreshTaskStatuses(referenceAt);
  await syncOverdueTaskNotifications(database);
}
