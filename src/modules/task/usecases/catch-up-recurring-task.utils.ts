import { type Task } from '@/modules/task/domain/task.types';

export function shouldCatchUpRecurringTask(task: Task, referenceTime: number) {
  return Boolean(
    task.isRecurring &&
      task.recurrenceType &&
      task.status !== 'completed' &&
      task.status !== 'trashed' &&
      new Date(task.dueAt).getTime() < referenceTime
  );
}
