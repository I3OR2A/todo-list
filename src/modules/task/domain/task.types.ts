export type TaskStatus = 'active' | 'overdue' | 'completed' | 'trashed';
export type Priority = 'high' | 'medium' | 'low';
export type RecurrenceType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom_days'
  | 'custom_weeks';

export type HomeViewType =
  | 'today'
  | 'upcoming'
  | 'all'
  | 'overdue'
  | 'by_category'
  | 'by_priority';

export interface Task {
  id: string;
  title: string;
  note?: string;
  dueAt: string;
  categoryId?: string | null;
  priority: Priority;
  status: TaskStatus;
  isRecurring: boolean;
  recurrenceType?: RecurrenceType | null;
  recurrenceInterval?: number | null;
  recurrenceGenerateMode?: 'after_completion' | null;
  parentTaskId?: string | null;
  completedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListItem extends Task {
  categoryName?: string | null;
  reminderCount?: number;
  incompleteSubTaskCount?: number;
}

export interface CreateTaskInput {
  title: string;
  note?: string;
  dueAt: string;
  categoryId?: string | null;
  priority: Priority;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType | null;
  recurrenceInterval?: number | null;
  recurrenceGenerateMode?: 'after_completion' | null;
  parentTaskId?: string | null;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
  completedAt?: string | null;
  deletedAt?: string | null;
}

export interface TaskSearchQuery {
  keyword?: string;
  categoryIds?: string[];
  statuses?: ('active' | 'overdue' | 'completed' | 'trashed')[];
  priority?: ('high' | 'medium' | 'low')[];
  hasReminder?: boolean;
  isRecurring?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'dueAt' | 'createdAt' | 'updatedAt' | 'priority' | 'category';
  sortOrder?: 'asc' | 'desc';
}
