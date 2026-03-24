import { type SQLiteDatabase } from 'expo-sqlite';

import { getNotificationPermissions, scheduleTaskReminderNotification } from '@/modules/notification/services/local-notification.service';
import { cancelTaskNotifications } from '@/modules/notification/usecases/cancel-task-notifications';
import { SQLiteReminderRepository } from '@/modules/reminder/repository/sqlite-reminder.repository';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';
import { SQLiteTaskRepository } from '@/modules/task/repository/sqlite-task.repository';

export async function syncTaskNotifications(database: SQLiteDatabase, taskId: string) {
  const taskRepository = new SQLiteTaskRepository(database);
  const reminderRepository = new SQLiteReminderRepository(database);
  const settingsRepository = new SQLiteSettingsRepository(database);
  const [task, settings] = await Promise.all([
    taskRepository.getTaskById(taskId),
    settingsRepository.getSettings(),
  ]);

  await cancelTaskNotifications(database, taskId);

  if (
    !task ||
    task.status === 'completed' ||
    task.status === 'trashed' ||
    !settings.notificationsEnabled
  ) {
    return;
  }

  const permission = await getNotificationPermissions();

  if (!permission.granted) {
    return;
  }

  const reminders = await reminderRepository.listByTaskId(taskId);

  for (const reminder of reminders) {
    if (
      reminder.reminderType === 'normal' &&
      new Date(reminder.remindAt).getTime() <= Date.now()
    ) {
      continue;
    }

    const notificationRequestId = await scheduleTaskReminderNotification(task, reminder);
    await reminderRepository.updateNotificationRequestId(reminder.id, notificationRequestId);
  }
}
