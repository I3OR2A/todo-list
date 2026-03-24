import { type SQLiteDatabase } from 'expo-sqlite';

import { type ReminderInput, type TaskReminder } from '@/modules/reminder/domain/reminder.types';
import { type ReminderRepository } from '@/modules/reminder/repository/reminder.repository';
import { createId } from '@/shared/utils/id';

type TaskReminderRow = {
  id: string;
  task_id: string;
  remind_at: string;
  reminder_type: 'normal' | 'overdue';
  notification_request_id: string | null;
  created_at: string;
  updated_at: string;
};

export class SQLiteReminderRepository implements ReminderRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async createReminder(taskId: string, reminder: ReminderInput): Promise<TaskReminder> {
    const reminderId = createId('reminder');
    const now = new Date().toISOString();

    await this.database.runAsync(
      `
        INSERT INTO task_reminders (
          id,
          task_id,
          remind_at,
          reminder_type,
          notification_request_id,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      reminderId,
      taskId,
      reminder.remindAt,
      reminder.reminderType,
      null,
      now,
      now
    );

    return {
      createdAt: now,
      id: reminderId,
      notificationRequestId: null,
      remindAt: reminder.remindAt,
      reminderType: reminder.reminderType,
      taskId,
      updatedAt: now,
    };
  }

  async getReminderById(reminderId: string): Promise<TaskReminder | null> {
    const row = await this.database.getFirstAsync<TaskReminderRow>(
      `
        SELECT
          id,
          task_id,
          remind_at,
          reminder_type,
          notification_request_id,
          created_at,
          updated_at
        FROM task_reminders
        WHERE id = ?
      `,
      reminderId
    );

    return row ? mapReminder(row) : null;
  }

  async replaceTaskReminders(taskId: string, reminders: ReminderInput[]): Promise<void> {
    await this.database.runAsync(`DELETE FROM task_reminders WHERE task_id = ?`, taskId);

    for (const reminder of reminders) {
      await this.createReminder(taskId, reminder);
    }
  }

  async listAll(): Promise<TaskReminder[]> {
    const rows = await this.database.getAllAsync<TaskReminderRow>(
      `
        SELECT
          id,
          task_id,
          remind_at,
          reminder_type,
          notification_request_id,
          created_at,
          updated_at
        FROM task_reminders
        ORDER BY remind_at ASC
      `
    );

    return rows.map(mapReminder);
  }

  async listByTaskId(taskId: string): Promise<TaskReminder[]> {
    const rows = await this.database.getAllAsync<TaskReminderRow>(
      `
        SELECT
          id,
          task_id,
          remind_at,
          reminder_type,
          notification_request_id,
          created_at,
          updated_at
        FROM task_reminders
        WHERE task_id = ?
        ORDER BY remind_at ASC
      `,
      taskId
    );

    return rows.map(mapReminder);
  }

  async deleteByTaskId(taskId: string): Promise<void> {
    await this.database.runAsync(`DELETE FROM task_reminders WHERE task_id = ?`, taskId);
  }

  async updateNotificationRequestId(
    reminderId: string,
    notificationRequestId: string | null
  ): Promise<void> {
    await this.database.runAsync(
      `
        UPDATE task_reminders
        SET notification_request_id = ?, updated_at = ?
        WHERE id = ?
      `,
      notificationRequestId,
      new Date().toISOString(),
      reminderId
    );
  }

  async clearAllNotificationRequestIds(): Promise<void> {
    await this.database.runAsync(
      `
        UPDATE task_reminders
        SET notification_request_id = NULL, updated_at = ?
      `,
      new Date().toISOString()
    );
  }
}

function mapReminder(row: TaskReminderRow): TaskReminder {
  return {
    id: row.id,
    taskId: row.task_id,
    remindAt: row.remind_at,
    reminderType: row.reminder_type,
    notificationRequestId: row.notification_request_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
