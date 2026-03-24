import { type SQLiteDatabase } from 'expo-sqlite';

import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function listTrashTasks(database: SQLiteDatabase) {
  const taskRepository = new SQLiteTaskRepository(database);
  return taskRepository.searchTasks({
    statuses: ['trashed'],
  });
}
