export type ReminderType = 'normal' | 'overdue';

export interface TaskReminder {
  id: string;
  taskId: string;
  remindAt: string;
  reminderType: ReminderType;
  notificationRequestId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderInput {
  remindAt: string;
  reminderType: ReminderType;
}
