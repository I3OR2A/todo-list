import { type SQLiteDatabase } from 'expo-sqlite';

import { cancelAllScheduledNotifications, requestNotificationPermissions } from '@/modules/notification/services/local-notification.service';
import { rebuildDailySummaryNotification } from '@/modules/notification/usecases/rebuild-daily-summary-notification';
import { rescheduleAllTaskNotifications } from '@/modules/notification/usecases/reschedule-all-task-notifications';
import { SQLiteReminderRepository } from '@/modules/reminder/repository/sqlite-reminder.repository';
import { type AppSetting } from '@/modules/settings/domain/app-setting.types';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';

export async function saveNotificationSettings(
  database: SQLiteDatabase,
  input: Partial<AppSetting>
) {
  const settingsRepository = new SQLiteSettingsRepository(database);
  const reminderRepository = new SQLiteReminderRepository(database);
  const currentSettings = await settingsRepository.getSettings();
  const nextNotificationsEnabled =
    input.notificationsEnabled ?? currentSettings.notificationsEnabled;

  if (nextNotificationsEnabled) {
    const permission = await requestNotificationPermissions();

    if (!permission.granted) {
      await settingsRepository.updateSettings({
        ...input,
        dailySummaryEnabled: false,
        notificationsEnabled: false,
      });

      return {
        granted: false,
        settings: await settingsRepository.getSettings(),
      };
    }
  }

  await settingsRepository.updateSettings(input);

  if (!nextNotificationsEnabled) {
    await cancelAllScheduledNotifications();
    await reminderRepository.clearAllNotificationRequestIds();

    return {
      granted: true,
      settings: await settingsRepository.getSettings(),
    };
  }

  await rescheduleAllTaskNotifications(database);
  await rebuildDailySummaryNotification(database);

  return {
    granted: true,
    settings: await settingsRepository.getSettings(),
  };
}
