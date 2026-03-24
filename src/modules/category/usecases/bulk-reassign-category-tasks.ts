import { type SQLiteDatabase } from 'expo-sqlite';

import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function bulkReassignCategoryTasks(
  database: SQLiteDatabase,
  fromCategoryId: string,
  toCategoryId: string | null
) {
  const taskRepository = new SQLiteTaskRepository(database);
  const tasks = await taskRepository.searchTasks({
    statuses: ['active', 'overdue', 'completed'],
  });
  const taskIds = tasks
    .filter((task) => task.categoryId === fromCategoryId)
    .map((task) => task.id);

  if (taskIds.length === 0) {
    return;
  }

  await taskRepository.bulkUpdateCategory(taskIds, toCategoryId);
}
