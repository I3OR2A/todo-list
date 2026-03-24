import { type SQLiteDatabase } from 'expo-sqlite';

import { syncTaskNotifications } from '@/modules/notification/usecases/sync-task-notifications';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';
import { shouldCatchUpRecurringTask } from '@/modules/task/usecases/catch-up-recurring-task.utils';
import { generateNextRecurringTask } from '@/modules/task/usecases/generate-next-recurring-task';

export async function catchUpRecurringTasks(
  database: SQLiteDatabase,
  referenceAt = new Date().toISOString()
) {
  const taskRepository = new SQLiteTaskRepository(database);
  const referenceTime = new Date(referenceAt).getTime();
  const initialCandidates = await taskRepository.listRecurringTasksDueBefore(referenceAt);
  const queue = [...initialCandidates];
  const visitedTaskIds = new Set<string>();

  while (queue.length > 0) {
    const currentTask = queue.shift();

    if (!currentTask || visitedTaskIds.has(currentTask.id)) {
      continue;
    }

    visitedTaskIds.add(currentTask.id);

    if (!shouldCatchUpRecurringTask(currentTask, referenceTime)) {
      continue;
    }

    const existingChildTask = await taskRepository.getTaskByParentTaskId(currentTask.id);

    if (existingChildTask) {
      if (new Date(existingChildTask.dueAt).getTime() < referenceTime) {
        queue.push(existingChildTask);
      }

      continue;
    }

    const nextTaskId = await generateNextRecurringTask(database, currentTask.id);

    if (!nextTaskId) {
      continue;
    }

    await syncTaskNotifications(database, nextTaskId);

    const nextTask = await taskRepository.getTaskById(nextTaskId);

    if (nextTask && new Date(nextTask.dueAt).getTime() < referenceTime) {
      queue.push(nextTask);
    }
  }
}
