import { type SQLiteDatabase } from 'expo-sqlite';

import { moveTaskToTrash } from '@/modules/task/usecases/move-task-to-trash';

export async function bulkMoveTasksToTrash(database: SQLiteDatabase, taskIds: string[]) {
  for (const taskId of taskIds) {
    await moveTaskToTrash(database, taskId);
  }
}
