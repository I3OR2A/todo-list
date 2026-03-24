import * as FileSystem from 'expo-file-system/legacy';
import { type SQLiteDatabase } from 'expo-sqlite';

import { SQLiteCategoryRepository } from '@/modules/category/repository/sqlite/sqlite-category.repository';
import {
  type ExportPayload,
  type ExportResult,
  type ExportType,
} from '@/modules/export/domain/export.types';
import { buildExportPayload } from '@/modules/export/utils/build-export-payload';
import { SQLiteReminderRepository } from '@/modules/reminder/repository/sqlite-reminder.repository';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';
import { SQLiteSubTaskRepository } from '@/modules/subtask/repository/sqlite-subtask.repository';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';
import { createId } from '@/shared/utils/id';

type ExportTasksInput = {
  dateFrom?: string;
  dateTo?: string;
  exportType: ExportType;
};

export async function exportTasks(
  database: SQLiteDatabase,
  input: ExportTasksInput
): Promise<ExportResult> {
  const taskRepository = new SQLiteTaskRepository(database);
  const subTaskRepository = new SQLiteSubTaskRepository(database);
  const reminderRepository = new SQLiteReminderRepository(database);
  const categoryRepository = new SQLiteCategoryRepository(database);
  const settingsRepository = new SQLiteSettingsRepository(database);

  const [tasks, allSubTasks, allReminders, categories, settings] = await Promise.all([
    listTasksForExport(taskRepository, input),
    listAllSubTasks(database, subTaskRepository),
    reminderRepository.listAll(),
    categoryRepository.listCategories(),
    settingsRepository.getSettings(),
  ]);

  const payload = buildExportPayload({
    categories,
    exportType: input.exportType,
    reminders: allReminders,
    settings,
    subTasks: allSubTasks,
    tasks,
  });

  const fileUri = await writeExportPayload(payload);
  await logExport(database, input.exportType, fileUri);

  return {
    fileUri,
    payload,
  };
}

async function listTasksForExport(
  taskRepository: SQLiteTaskRepository,
  input: ExportTasksInput
) {
  if (input.exportType === 'completed_only') {
    return taskRepository.getTasksByStatus('completed');
  }

  if (input.exportType === 'range' && input.dateFrom && input.dateTo) {
    return taskRepository.searchTasks({
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      statuses: ['active', 'overdue', 'completed', 'trashed'],
      sortBy: 'dueAt',
      sortOrder: 'asc',
    });
  }

  return taskRepository.searchTasks({
    statuses: ['active', 'overdue', 'completed', 'trashed'],
    sortBy: 'dueAt',
    sortOrder: 'asc',
  });
}

async function listAllSubTasks(
  database: SQLiteDatabase,
  subTaskRepository: SQLiteSubTaskRepository
) {
  const taskIds = await database.getAllAsync<{ id: string }>(`SELECT id FROM tasks`);
  const results = await Promise.all(taskIds.map((task) => subTaskRepository.listByTaskId(task.id)));
  return results.flat();
}

async function writeExportPayload(payload: ExportPayload) {
  const documentDirectory = FileSystem.documentDirectory;

  if (!documentDirectory) {
    throw new Error('Export directory is not available on this device.');
  }

  const fileUri = `${documentDirectory}cute-todo-export-${payload.export_type}-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));
  return fileUri;
}

async function logExport(database: SQLiteDatabase, exportType: ExportType, fileUri: string) {
  await database.runAsync(
    `
      INSERT INTO export_logs (id, export_type, file_name, created_at)
      VALUES (?, ?, ?, ?)
    `,
    createId('export'),
    exportType,
    fileUri.split('/').pop() ?? fileUri,
    new Date().toISOString()
  );
}
