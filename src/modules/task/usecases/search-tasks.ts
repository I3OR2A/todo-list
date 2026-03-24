import { type SQLiteDatabase } from 'expo-sqlite';

import { type TaskSearchQuery } from '@/modules/task/domain/task.types';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function searchTasks(database: SQLiteDatabase, query: TaskSearchQuery) {
  const taskRepository = new SQLiteTaskRepository(database);
  return taskRepository.searchTasks(query);
}
