import { type SQLiteDatabase } from 'expo-sqlite';

import {
  DAILY_SUMMARY_NOTIFICATION_ID,
  cancelScheduledNotification,
  getNotificationPermissions,
  scheduleDailySummaryNotification,
} from '@/modules/notification/services/local-notification.service';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function rebuildDailySummaryNotification(database: SQLiteDatabase) {
  await cancelScheduledNotification(DAILY_SUMMARY_NOTIFICATION_ID).catch(() => undefined);

  const settingsRepository = new SQLiteSettingsRepository(database);
  const taskRepository = new SQLiteTaskRepository(database);
  const settings = await settingsRepository.getSettings();

  if (
    !settings.notificationsEnabled ||
    !settings.dailySummaryEnabled ||
    !settings.dailySummaryTime
  ) {
    return;
  }

  const permission = await getNotificationPermissions();

  if (!permission.granted) {
    return;
  }

  const todayTasks = await taskRepository.getTasksForHomeView('today');
  await scheduleDailySummaryNotification(
    getNextDailySummaryDate(settings.dailySummaryTime),
    todayTasks.length
  );
}

function getNextDailySummaryDate(time: string) {
  const [hours, minutes] = time.split(':').map((value) => Number(value));
  const nextDate = new Date();
  nextDate.setHours(hours, minutes, 0, 0);

  if (nextDate.getTime() <= Date.now()) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
}
