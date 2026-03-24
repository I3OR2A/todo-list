import {
  mapCategoryToExportRow,
  mapReminderToExportRow,
  mapSettingsToExportRow,
  mapSubTaskToExportRow,
  mapTaskToExportRow,
  type ExportPayload,
  type ExportType,
} from '@/modules/export/domain/export.types';
import { type TaskReminder } from '@/modules/reminder/domain/reminder.types';
import { type AppSetting } from '@/modules/settings/domain/app-setting.types';
import { type TaskSubItem } from '@/modules/subtask/domain/subtask.types';
import { type Task } from '@/modules/task/domain/task.types';
import { type Category } from '@/modules/category/domain/category.types';

export function buildExportPayload({
  categories,
  exportType,
  reminders,
  settings,
  subTasks,
  tasks,
}: {
  categories: Category[];
  exportType: ExportType;
  reminders: TaskReminder[];
  settings: AppSetting;
  subTasks: TaskSubItem[];
  tasks: Task[];
}): ExportPayload {
  const exportedTaskIds = new Set(tasks.map((task) => task.id));

  return {
    app_settings: mapSettingsToExportRow(settings),
    categories: categories.map(mapCategoryToExportRow),
    exported_at: new Date().toISOString(),
    export_type: exportType,
    schema_version: '1.0.0',
    task_reminders: reminders
      .filter((reminder) => exportedTaskIds.has(reminder.taskId))
      .map(mapReminderToExportRow),
    task_sub_items: subTasks
      .filter((subTask) => exportedTaskIds.has(subTask.taskId))
      .map(mapSubTaskToExportRow),
    tasks: tasks.map(mapTaskToExportRow),
  };
}
