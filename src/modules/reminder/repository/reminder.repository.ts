import { type ReminderInput, type TaskReminder } from '@/modules/reminder/domain/reminder.types';

export interface ReminderRepository {
  createReminder(taskId: string, reminder: ReminderInput): Promise<TaskReminder>;
  getReminderById(reminderId: string): Promise<TaskReminder | null>;
  replaceTaskReminders(taskId: string, reminders: ReminderInput[]): Promise<void>;
  listAll(): Promise<TaskReminder[]>;
  listByTaskId(taskId: string): Promise<TaskReminder[]>;
  updateNotificationRequestId(reminderId: string, notificationRequestId: string | null): Promise<void>;
  clearAllNotificationRequestIds(): Promise<void>;
  deleteByTaskId(taskId: string): Promise<void>;
}
