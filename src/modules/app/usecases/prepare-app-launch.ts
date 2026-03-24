import { type SQLiteDatabase } from 'expo-sqlite';

import { rebuildDailySummaryNotification } from '@/modules/notification/usecases/rebuild-daily-summary-notification';
import { rescheduleAllTaskNotifications } from '@/modules/notification/usecases/reschedule-all-task-notifications';
import { type AppSetting } from '@/modules/settings/domain/app-setting.types';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';
import { cleanupTrash } from '@/modules/task/usecases/cleanup-trash';
import { refreshTaskStatuses } from '@/modules/task/usecases/refresh-task-statuses';

export async function prepareAppLaunch(database: SQLiteDatabase): Promise<AppSetting> {
  await cleanupTrash(database);
  await refreshTaskStatuses(database);
  await rescheduleAllTaskNotifications(database);
  await rebuildDailySummaryNotification(database);

  const settingsRepository = new SQLiteSettingsRepository(database);
  return settingsRepository.getSettings();
}
