import { type SQLiteDatabase } from 'expo-sqlite';

import { SQLiteCategoryRepository } from '@/modules/category/repository/sqlite/sqlite-category.repository';
import { SQLiteReminderRepository } from '@/modules/reminder/repository/sqlite-reminder.repository';
import { type TaskDetail } from '@/modules/task/domain/task-detail.types';
import { SQLiteSubTaskRepository } from '@/modules/subtask/repository/sqlite-subtask.repository';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function getTaskDetail(
  database: SQLiteDatabase,
  taskId: string
): Promise<TaskDetail | null> {
  const taskRepository = new SQLiteTaskRepository(database);
  const subTaskRepository = new SQLiteSubTaskRepository(database);
  const reminderRepository = new SQLiteReminderRepository(database);
  const categoryRepository = new SQLiteCategoryRepository(database);

  const task = await taskRepository.getTaskById(taskId);

  if (!task) {
    return null;
  }

  const [subTasks, reminders, category] = await Promise.all([
    subTaskRepository.listByTaskId(taskId),
    reminderRepository.listByTaskId(taskId),
    task.categoryId ? categoryRepository.getCategoryById(task.categoryId) : Promise.resolve(null),
  ]);

  return {
    category,
    task,
    subTasks,
    reminders,
  };
}
