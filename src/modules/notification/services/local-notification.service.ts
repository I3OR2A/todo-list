import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { type TaskReminder } from '@/modules/reminder/domain/reminder.types';
import { type Task } from '@/modules/task/domain/task.types';
import { formatTaskDateTime } from '@/shared/utils/datetime';

const NOTIFICATION_CHANNEL_ID = 'default';
export const DAILY_SUMMARY_NOTIFICATION_ID = 'daily-summary';

let isNotificationHandlerConfigured = false;

export function configureNotificationHandler() {
  if (isNotificationHandlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  isNotificationHandlerConfigured = true;
}

export async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Task reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function getNotificationPermissions() {
  const status = await Notifications.getPermissionsAsync();

  return {
    canAskAgain: status.canAskAgain,
    granted: status.granted,
    status: status.status,
  };
}

export async function requestNotificationPermissions() {
  const status = await Notifications.requestPermissionsAsync();

  return {
    canAskAgain: status.canAskAgain,
    granted: status.granted,
    status: status.status,
  };
}

export async function scheduleTaskReminderNotification(task: Task, reminder: TaskReminder) {
  await ensureNotificationChannel();

  return Notifications.scheduleNotificationAsync({
    identifier: reminder.id,
    content: {
      title: task.title,
      body:
        reminder.reminderType === 'overdue'
          ? `Overdue since ${formatTaskDateTime(task.dueAt)}`
          : `Due ${formatTaskDateTime(task.dueAt)}`,
      sound: true,
    },
    trigger: {
      channelId: NOTIFICATION_CHANNEL_ID,
      date: getSafeFutureDate(reminder.remindAt),
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
  });
}

export async function scheduleDailySummaryNotification(date: Date, todayTaskCount: number) {
  await ensureNotificationChannel();

  return Notifications.scheduleNotificationAsync({
    identifier: DAILY_SUMMARY_NOTIFICATION_ID,
    content: {
      title: 'Daily Summary',
      body:
        todayTaskCount === 0
          ? 'No tasks are due today.'
          : `You have ${todayTaskCount} task${todayTaskCount === 1 ? '' : 's'} due today.`,
      sound: true,
    },
    trigger: {
      channelId: NOTIFICATION_CHANNEL_ID,
      date: getSafeFutureDate(date.toISOString()),
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
  });
}

export async function cancelScheduledNotification(notificationRequestId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationRequestId);
}

export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function getSafeFutureDate(isoValue: string) {
  const parsedDate = new Date(isoValue);

  if (Number.isNaN(parsedDate.getTime()) || parsedDate.getTime() <= Date.now()) {
    return new Date(Date.now() + 5_000);
  }

  return parsedDate;
}
