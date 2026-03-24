import { type SQLiteDatabase } from 'expo-sqlite';

import { type TaskSubItem } from '@/modules/subtask/domain/subtask.types';
import { type SubTaskRepository } from '@/modules/subtask/repository/subtask.repository';
import { createId } from '@/shared/utils/id';

type TaskSubItemRow = {
  id: string;
  task_id: string;
  title: string;
  is_completed: number;
  created_at: string;
  updated_at: string;
};

export class SQLiteSubTaskRepository implements SubTaskRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async createSubTask(taskId: string, title: string): Promise<string> {
    const subTaskId = createId('subtask');
    const now = new Date().toISOString();

    await this.database.runAsync(
      `
        INSERT INTO task_sub_items (id, task_id, title, is_completed, created_at, updated_at)
        VALUES (?, ?, ?, 0, ?, ?)
      `,
      subTaskId,
      taskId,
      title.trim(),
      now,
      now
    );

    return subTaskId;
  }

  async updateSubTask(subTaskId: string, title: string): Promise<void> {
    await this.database.runAsync(
      `
        UPDATE task_sub_items
        SET title = ?, updated_at = ?
        WHERE id = ?
      `,
      title.trim(),
      new Date().toISOString(),
      subTaskId
    );
  }

  async toggleSubTask(subTaskId: string, isCompleted: boolean): Promise<void> {
    await this.database.runAsync(
      `
        UPDATE task_sub_items
        SET is_completed = ?, updated_at = ?
        WHERE id = ?
      `,
      isCompleted ? 1 : 0,
      new Date().toISOString(),
      subTaskId
    );
  }

  async deleteSubTask(subTaskId: string): Promise<void> {
    await this.database.runAsync(`DELETE FROM task_sub_items WHERE id = ?`, subTaskId);
  }

  async getSubTaskById(subTaskId: string): Promise<TaskSubItem | null> {
    const row = await this.database.getFirstAsync<TaskSubItemRow>(
      `
        SELECT id, task_id, title, is_completed, created_at, updated_at
        FROM task_sub_items
        WHERE id = ?
      `,
      subTaskId
    );

    return row ? mapSubTask(row) : null;
  }

  async listByTaskId(taskId: string): Promise<TaskSubItem[]> {
    const rows = await this.database.getAllAsync<TaskSubItemRow>(
      `
        SELECT id, task_id, title, is_completed, created_at, updated_at
        FROM task_sub_items
        WHERE task_id = ?
        ORDER BY created_at ASC
      `,
      taskId
    );

    return rows.map(mapSubTask);
  }

  async countIncompleteByTaskId(taskId: string): Promise<number> {
    const row = await this.database.getFirstAsync<{ count: number }>(
      `
        SELECT COUNT(*) AS count
        FROM task_sub_items
        WHERE task_id = ? AND is_completed = 0
      `,
      taskId
    );

    return row?.count ?? 0;
  }

  async replaceSubTasks(taskId: string, titles: string[]) {
    await this.database.runAsync(`DELETE FROM task_sub_items WHERE task_id = ?`, taskId);

    for (const title of titles) {
      if (!title.trim()) {
        continue;
      }

      await this.createSubTask(taskId, title);
    }
  }
}

function mapSubTask(row: TaskSubItemRow): TaskSubItem {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    isCompleted: row.is_completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
