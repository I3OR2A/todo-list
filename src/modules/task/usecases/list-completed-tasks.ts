import { type SQLiteDatabase } from 'expo-sqlite';

import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function listCompletedTasks(database: SQLiteDatabase) {
  const taskRepository = new SQLiteTaskRepository(database);
  return taskRepository.searchTasks({
    statuses: ['completed'],
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
}
