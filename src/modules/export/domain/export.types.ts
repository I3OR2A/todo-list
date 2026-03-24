import { type Category } from '@/modules/category/domain/category.types';
import { type TaskReminder } from '@/modules/reminder/domain/reminder.types';
import { type AppSetting } from '@/modules/settings/domain/app-setting.types';
import { type TaskSubItem } from '@/modules/subtask/domain/subtask.types';
import { type Task } from '@/modules/task/domain/task.types';

export type ExportType = 'all' | 'range' | 'completed_only';

export type ExportTaskRow = {
  category_id: string | null;
  completed_at: string | null;
  created_at: string;
  deleted_at: string | null;
  due_at: string;
  id: string;
  is_recurring: boolean;
  note: string | null;
  parent_task_id: string | null;
  priority: Task['priority'];
  recurrence_generate_mode: Task['recurrenceGenerateMode'] | null;
  recurrence_interval: number | null;
  recurrence_type: Task['recurrenceType'] | null;
  status: Task['status'];
  title: string;
  updated_at: string;
};

export type ExportSubTaskRow = {
  created_at: string;
  id: string;
  is_completed: boolean;
  task_id: string;
  title: string;
  updated_at: string;
};

export type ExportReminderRow = {
  created_at: string;
  id: string;
  notification_request_id: string | null;
  remind_at: string;
  reminder_type: TaskReminder['reminderType'];
  task_id: string;
  updated_at: string;
};

export type ExportCategoryRow = {
  color: string;
  created_at: string;
  icon: string;
  id: string;
  name: string;
  sort_order: number;
  updated_at: string;
};

export type ExportSettingsRow = {
  daily_summary_enabled: boolean;
  daily_summary_time: string | null;
  default_reminder_json: string | null;
  default_sort: string;
  id: AppSetting['id'];
  notifications_enabled: boolean;
  onboarding_completed: boolean;
  theme_mode: AppSetting['themeMode'];
  updated_at: string;
};

export type ExportPayload = {
  app_settings: ExportSettingsRow;
  categories: ExportCategoryRow[];
  exported_at: string;
  export_type: ExportType;
  schema_version: '1.0.0';
  task_reminders: ExportReminderRow[];
  task_sub_items: ExportSubTaskRow[];
  tasks: ExportTaskRow[];
};

export type ExportResult = {
  fileUri: string;
  payload: ExportPayload;
};

export function mapTaskToExportRow(task: Task): ExportTaskRow {
  return {
    category_id: task.categoryId ?? null,
    completed_at: task.completedAt ?? null,
    created_at: task.createdAt,
    deleted_at: task.deletedAt ?? null,
    due_at: task.dueAt,
    id: task.id,
    is_recurring: task.isRecurring,
    note: task.note ?? null,
    parent_task_id: task.parentTaskId ?? null,
    priority: task.priority,
    recurrence_generate_mode: task.recurrenceGenerateMode ?? null,
    recurrence_interval: task.recurrenceInterval ?? null,
    recurrence_type: task.recurrenceType ?? null,
    status: task.status,
    title: task.title,
    updated_at: task.updatedAt,
  };
}

export function mapSubTaskToExportRow(subTask: TaskSubItem): ExportSubTaskRow {
  return {
    created_at: subTask.createdAt,
    id: subTask.id,
    is_completed: subTask.isCompleted,
    task_id: subTask.taskId,
    title: subTask.title,
    updated_at: subTask.updatedAt,
  };
}

export function mapReminderToExportRow(reminder: TaskReminder): ExportReminderRow {
  return {
    created_at: reminder.createdAt,
    id: reminder.id,
    notification_request_id: reminder.notificationRequestId ?? null,
    remind_at: reminder.remindAt,
    reminder_type: reminder.reminderType,
    task_id: reminder.taskId,
    updated_at: reminder.updatedAt,
  };
}

export function mapCategoryToExportRow(category: Category): ExportCategoryRow {
  return {
    color: category.color,
    created_at: category.createdAt,
    icon: category.icon,
    id: category.id,
    name: category.name,
    sort_order: category.sortOrder,
    updated_at: category.updatedAt,
  };
}

export function mapSettingsToExportRow(settings: AppSetting): ExportSettingsRow {
  return {
    daily_summary_enabled: settings.dailySummaryEnabled,
    daily_summary_time: settings.dailySummaryTime ?? null,
    default_reminder_json: settings.defaultReminderJson ?? null,
    default_sort: settings.defaultSort,
    id: settings.id,
    notifications_enabled: settings.notificationsEnabled,
    onboarding_completed: settings.onboardingCompleted,
    theme_mode: settings.themeMode,
    updated_at: settings.updatedAt,
  };
}
