import { type SQLiteDatabase } from 'expo-sqlite';

import { cancelScheduledNotification } from '@/modules/notification/services/local-notification.service';
import { SQLiteReminderRepository } from '@/modules/reminder/repository/sqlite-reminder.repository';

export async function cancelTaskNotifications(database: SQLiteDatabase, taskId: string) {
  const reminderRepository = new SQLiteReminderRepository(database);
  const reminders = await reminderRepository.listByTaskId(taskId);

  for (const reminder of reminders) {
    if (reminder.notificationRequestId) {
      await cancelScheduledNotification(reminder.notificationRequestId);
      await reminderRepository.updateNotificationRequestId(reminder.id, null);
    }
  }
}
