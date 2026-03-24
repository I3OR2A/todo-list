import { type TaskSubItem } from '@/modules/subtask/domain/subtask.types';

export interface SubTaskRepository {
  createSubTask(taskId: string, title: string): Promise<string>;
  updateSubTask(subTaskId: string, title: string): Promise<void>;
  toggleSubTask(subTaskId: string, isCompleted: boolean): Promise<void>;
  deleteSubTask(subTaskId: string): Promise<void>;
  getSubTaskById(subTaskId: string): Promise<TaskSubItem | null>;
  listByTaskId(taskId: string): Promise<TaskSubItem[]>;
  countIncompleteByTaskId(taskId: string): Promise<number>;
}
