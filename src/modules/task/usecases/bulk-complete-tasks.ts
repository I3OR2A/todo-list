import { type SQLiteDatabase } from 'expo-sqlite';

import { completeTask } from '@/modules/task/usecases/complete-task';

export async function bulkCompleteTasks(database: SQLiteDatabase, taskIds: string[]) {
  for (const taskId of taskIds) {
    await completeTask(database, taskId);
  }
}
