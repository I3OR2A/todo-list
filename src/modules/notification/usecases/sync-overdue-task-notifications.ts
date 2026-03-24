import { type SQLiteDatabase } from 'expo-sqlite';

import { getNotificationPermissions, scheduleTaskReminderNotification } from '@/modules/notification/services/local-notification.service';
import { type TaskReminder } from '@/modules/reminder/domain/reminder.types';
import { SQLiteReminderRepository } from '@/modules/reminder/repository/sqlite-reminder.repository';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function syncOverdueTaskNotifications(database: SQLiteDatabase) {
  const taskRepository = new SQLiteTaskRepository(database);
  const reminderRepository = new SQLiteReminderRepository(database);
  const settingsRepository = new SQLiteSettingsRepository(database);
  const settings = await settingsRepository.getSettings();

  if (!settings.notificationsEnabled) {
    return;
  }

  const permission = await getNotificationPermissions();

  if (!permission.granted) {
    return;
  }

  const overdueTasks = await taskRepository.getTasksByStatus('overdue');

  for (const task of overdueTasks) {
    const reminders = await reminderRepository.listByTaskId(task.id);
    let overdueReminder = reminders.find((reminder) => reminder.reminderType === 'overdue');

    if (!overdueReminder) {
      overdueReminder = await reminderRepository.createReminder(task.id, {
        remindAt: new Date().toISOString(),
        reminderType: 'overdue',
      });
    }

    if (overdueReminder.notificationRequestId) {
      continue;
    }

    const notificationRequestId = await scheduleTaskReminderNotification(
      task,
      overdueReminder as TaskReminder
    );
    await reminderRepository.updateNotificationRequestId(overdueReminder.id, notificationRequestId);
  }
}
