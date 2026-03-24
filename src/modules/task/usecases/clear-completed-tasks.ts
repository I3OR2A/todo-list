import { type SQLiteDatabase } from 'expo-sqlite';

import { listCompletedTasks } from '@/modules/task/usecases/list-completed-tasks';
import { permanentlyDeleteTask } from '@/modules/task/usecases/permanently-delete-task';

export async function clearCompletedTasks(database: SQLiteDatabase) {
  const completedTasks = await listCompletedTasks(database);

  for (const task of completedTasks) {
    await permanentlyDeleteTask(database, task.id);
  }
}
