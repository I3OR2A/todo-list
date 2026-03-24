import { type SQLiteDatabase } from 'expo-sqlite';

import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function bulkUpdateTaskCategory(
  database: SQLiteDatabase,
  taskIds: string[],
  categoryId: string | null
) {
  const taskRepository = new SQLiteTaskRepository(database);
  await taskRepository.bulkUpdateCategory(taskIds, categoryId);
}
