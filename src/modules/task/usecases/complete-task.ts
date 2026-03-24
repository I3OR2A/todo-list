import { type SQLiteDatabase } from 'expo-sqlite';

import { cancelTaskNotifications } from '@/modules/notification/usecases/cancel-task-notifications';
import { syncTaskNotifications } from '@/modules/notification/usecases/sync-task-notifications';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';
import { generateNextRecurringTask } from '@/modules/task/usecases/generate-next-recurring-task';

export type CompleteTaskResult = {
  completed: boolean;
  nextRecurringTaskId: string | null;
  wasRecurring: boolean;
};

export async function completeTask(database: SQLiteDatabase, taskId: string) {
  const taskRepository = new SQLiteTaskRepository(database);
  const task = await taskRepository.getTaskById(taskId);

  if (!task || task.status === 'completed' || task.status === 'trashed') {
    return {
      completed: false,
      nextRecurringTaskId: null,
      wasRecurring: Boolean(task?.isRecurring),
    } satisfies CompleteTaskResult;
  }

  let nextRecurringTaskId: string | null = null;

  await database.withTransactionAsync(async () => {
    await taskRepository.completeTask(taskId, new Date().toISOString());
    if (task.isRecurring) {
      nextRecurringTaskId = await generateNextRecurringTask(database, taskId);
    }
  });

  await cancelTaskNotifications(database, taskId);

  if (nextRecurringTaskId) {
    await syncTaskNotifications(database, nextRecurringTaskId);
  }

  return {
    completed: true,
    nextRecurringTaskId,
    wasRecurring: task.isRecurring,
  } satisfies CompleteTaskResult;
}
