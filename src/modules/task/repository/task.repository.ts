import {
  type CreateTaskInput,
  type HomeViewType,
  type Task,
  type TaskListItem,
  type TaskSearchQuery,
  type TaskStatus,
  type UpdateTaskInput,
} from '@/modules/task/domain/task.types';

export interface TaskRepository {
  createTask(input: CreateTaskInput): Promise<string>;
  updateTask(taskId: string, input: UpdateTaskInput): Promise<void>;
  moveTaskToTrash(taskId: string): Promise<void>;
  permanentlyDeleteTask(taskId: string): Promise<void>;
  completeTask(taskId: string, completedAt: string): Promise<void>;
  bulkCompleteTasks(taskIds: string[]): Promise<void>;
  bulkUpdateCategory(taskIds: string[], categoryId: string | null): Promise<void>;
  clearCompletedTasks(): Promise<void>;

  getTaskById(taskId: string): Promise<Task | null>;
  getTaskByParentTaskId(parentTaskId: string): Promise<Task | null>;
  getTasksByStatus(status: TaskStatus): Promise<Task[]>;
  listRecurringTasksDueBefore(referenceAt: string): Promise<Task[]>;
  searchTasks(query: TaskSearchQuery): Promise<TaskListItem[]>;
  getTasksForHomeView(view: HomeViewType): Promise<TaskListItem[]>;
  getExpiredTrashTasks(beforeAt: string): Promise<Task[]>;
  refreshTaskStatuses(referenceAt: string): Promise<void>;
}
