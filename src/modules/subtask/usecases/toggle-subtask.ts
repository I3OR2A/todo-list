import { type SQLiteDatabase } from 'expo-sqlite';

import { SQLiteSubTaskRepository } from '@/modules/subtask/repository/sqlite-subtask.repository';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';
import { completeTask } from '@/modules/task/usecases/complete-task';

export async function toggleSubTask(
  database: SQLiteDatabase,
  taskId: string,
  subTaskId: string,
  isCompleted: boolean
) {
  const subTaskRepository = new SQLiteSubTaskRepository(database);
  const taskRepository = new SQLiteTaskRepository(database);
  const task = await taskRepository.getTaskById(taskId);

  if (!task || task.status === 'completed' || task.status === 'trashed') {
    return null;
  }

  await subTaskRepository.toggleSubTask(subTaskId, isCompleted);

  if (!isCompleted) {
    return null;
  }

  const incompleteCount = await subTaskRepository.countIncompleteByTaskId(taskId);
  if (incompleteCount === 0) {
    return completeTask(database, taskId);
  }

  return null;
}
