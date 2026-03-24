import { type Category } from '@/modules/category/domain/category.types';
import { type TaskReminder } from '@/modules/reminder/domain/reminder.types';
import { type TaskSubItem } from '@/modules/subtask/domain/subtask.types';
import {
  type CreateTaskInput,
  type Priority,
  type RecurrenceType,
  type Task,
  type TaskListItem,
} from '@/modules/task/domain/task.types';

export interface TaskDetail {
  task: Task;
  subTasks: TaskSubItem[];
  reminders: TaskReminder[];
  category?: Category | null;
}

export interface TaskFormDraft {
  title: string;
  note: string;
  dueDate: string;
  dueTime: string;
  categoryId: string | null;
  priority: Priority;
  recurrenceType: RecurrenceType | null;
  recurrenceInterval: string;
  subTaskTitles: string[];
  reminderValues: string[];
}

export interface TaskMutationInput extends CreateTaskInput {
  subTaskTitles: string[];
  reminders: string[];
}

export interface TaskFormErrors {
  title?: string;
  dueDate?: string;
  dueTime?: string;
  recurrenceInterval?: string;
  reminders?: Record<number, string>;
  form?: string;
}

export interface HomeTaskSection {
  title: string;
  items: TaskListItem[];
}
