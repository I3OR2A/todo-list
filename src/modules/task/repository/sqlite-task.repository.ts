import { type SQLiteDatabase } from 'expo-sqlite';

import {
  type CreateTaskInput,
  type HomeViewType,
  type Task,
  type TaskListItem,
  type TaskSearchQuery,
  type TaskStatus,
  type UpdateTaskInput,
} from '@/modules/task/domain/task.types';
import { type TaskRepository } from '@/modules/task/repository/task.repository';
import { createId } from '@/shared/utils/id';

type TaskRow = {
  id: string;
  title: string;
  note: string | null;
  due_at: string;
  category_id: string | null;
  priority: 'high' | 'medium' | 'low';
  status: TaskStatus;
  is_recurring: number;
  recurrence_type: Task['recurrenceType'];
  recurrence_interval: number | null;
  recurrence_generate_mode: Task['recurrenceGenerateMode'];
  parent_task_id: string | null;
  completed_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
  reminder_count?: number;
  incomplete_sub_task_count?: number;
};

export class SQLiteTaskRepository implements TaskRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async createTask(input: CreateTaskInput): Promise<string> {
    const taskId = createId('task');
    const now = new Date().toISOString();

    await this.database.runAsync(
      `
        INSERT INTO tasks (
          id,
          title,
          note,
          due_at,
          category_id,
          priority,
          status,
          is_recurring,
          recurrence_type,
          recurrence_interval,
          recurrence_generate_mode,
          parent_task_id,
          completed_at,
          deleted_at,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      taskId,
      input.title.trim(),
      input.note?.trim() || null,
      input.dueAt,
      input.categoryId ?? null,
      input.priority,
      'active',
      input.isRecurring ? 1 : 0,
      input.recurrenceType ?? null,
      input.recurrenceInterval ?? null,
      input.recurrenceGenerateMode ?? null,
      input.parentTaskId ?? null,
      null,
      null,
      now,
      now
    );

    return taskId;
  }

  async updateTask(taskId: string, input: UpdateTaskInput): Promise<void> {
    const assignments: string[] = [];
    const values: (string | number | null)[] = [];

    if (input.title !== undefined) {
      assignments.push('title = ?');
      values.push(input.title.trim());
    }

    if (input.note !== undefined) {
      assignments.push('note = ?');
      values.push(input.note?.trim() || null);
    }

    if (input.dueAt !== undefined) {
      assignments.push('due_at = ?');
      values.push(input.dueAt);
    }

    if (input.categoryId !== undefined) {
      assignments.push('category_id = ?');
      values.push(input.categoryId ?? null);
    }

    if (input.priority !== undefined) {
      assignments.push('priority = ?');
      values.push(input.priority);
    }

    if (input.status !== undefined) {
      assignments.push('status = ?');
      values.push(input.status);
    }

    if (input.completedAt !== undefined) {
      assignments.push('completed_at = ?');
      values.push(input.completedAt ?? null);
    }

    if (input.deletedAt !== undefined) {
      assignments.push('deleted_at = ?');
      values.push(input.deletedAt ?? null);
    }

    if (input.isRecurring !== undefined) {
      assignments.push('is_recurring = ?');
      values.push(input.isRecurring ? 1 : 0);
    }

    if (input.recurrenceType !== undefined) {
      assignments.push('recurrence_type = ?');
      values.push(input.recurrenceType ?? null);
    }

    if (input.recurrenceInterval !== undefined) {
      assignments.push('recurrence_interval = ?');
      values.push(input.recurrenceInterval ?? null);
    }

    if (input.recurrenceGenerateMode !== undefined) {
      assignments.push('recurrence_generate_mode = ?');
      values.push(input.recurrenceGenerateMode ?? null);
    }

    if (input.parentTaskId !== undefined) {
      assignments.push('parent_task_id = ?');
      values.push(input.parentTaskId ?? null);
    }

    assignments.push('updated_at = ?');
    values.push(new Date().toISOString());

    await this.database.runAsync(
      `
        UPDATE tasks
        SET ${assignments.join(', ')}
        WHERE id = ?
      `,
      ...values,
      taskId
    );
  }

  async moveTaskToTrash(taskId: string): Promise<void> {
    const now = new Date().toISOString();

    await this.database.runAsync(
      `
        UPDATE tasks
        SET status = 'trashed', deleted_at = ?, updated_at = ?
        WHERE id = ?
      `,
      now,
      now,
      taskId
    );
  }

  async permanentlyDeleteTask(taskId: string): Promise<void> {
    await this.database.runAsync('DELETE FROM tasks WHERE id = ?', taskId);
  }

  async completeTask(taskId: string, completedAt: string): Promise<void> {
    await this.database.runAsync(
      `
        UPDATE tasks
        SET status = 'completed', completed_at = ?, updated_at = ?
        WHERE id = ?
      `,
      completedAt,
      new Date().toISOString(),
      taskId
    );
  }

  async bulkCompleteTasks(taskIds: string[]): Promise<void> {
    if (taskIds.length === 0) {
      return;
    }

    const placeholders = taskIds.map(() => '?').join(', ');
    const completedAt = new Date().toISOString();

    await this.database.runAsync(
      `
        UPDATE tasks
        SET status = 'completed', completed_at = ?, updated_at = ?
        WHERE id IN (${placeholders})
      `,
      completedAt,
      completedAt,
      ...taskIds
    );
  }

  async bulkUpdateCategory(taskIds: string[], categoryId: string | null): Promise<void> {
    if (taskIds.length === 0) {
      return;
    }

    const placeholders = taskIds.map(() => '?').join(', ');
    await this.database.runAsync(
      `
        UPDATE tasks
        SET category_id = ?, updated_at = ?
        WHERE id IN (${placeholders})
      `,
      categoryId,
      new Date().toISOString(),
      ...taskIds
    );
  }

  async clearCompletedTasks(): Promise<void> {
    await this.database.runAsync(`DELETE FROM tasks WHERE status = 'completed'`);
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    const row = await this.database.getFirstAsync<TaskRow>(
      `
        SELECT
          id,
          title,
          note,
          due_at,
          category_id,
          priority,
          status,
          is_recurring,
          recurrence_type,
          recurrence_interval,
          recurrence_generate_mode,
          parent_task_id,
          completed_at,
          deleted_at,
          created_at,
          updated_at
        FROM tasks
        WHERE id = ?
      `,
      taskId
    );

    return row ? mapTask(row) : null;
  }

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    const rows = await this.database.getAllAsync<TaskRow>(
      `
        SELECT
          id,
          title,
          note,
          due_at,
          category_id,
          priority,
          status,
          is_recurring,
          recurrence_type,
          recurrence_interval,
          recurrence_generate_mode,
          parent_task_id,
          completed_at,
          deleted_at,
          created_at,
          updated_at
        FROM tasks
        WHERE status = ?
        ORDER BY due_at ASC
      `,
      status
    );

    return rows.map(mapTask);
  }

  async getTaskByParentTaskId(parentTaskId: string): Promise<Task | null> {
    const row = await this.database.getFirstAsync<TaskRow>(
      `
        SELECT
          id,
          title,
          note,
          due_at,
          category_id,
          priority,
          status,
          is_recurring,
          recurrence_type,
          recurrence_interval,
          recurrence_generate_mode,
          parent_task_id,
          completed_at,
          deleted_at,
          created_at,
          updated_at
        FROM tasks
        WHERE parent_task_id = ?
        ORDER BY due_at ASC
        LIMIT 1
      `,
      parentTaskId
    );

    return row ? mapTask(row) : null;
  }

  async listRecurringTasksDueBefore(referenceAt: string): Promise<Task[]> {
    const rows = await this.database.getAllAsync<TaskRow>(
      `
        SELECT
          id,
          title,
          note,
          due_at,
          category_id,
          priority,
          status,
          is_recurring,
          recurrence_type,
          recurrence_interval,
          recurrence_generate_mode,
          parent_task_id,
          completed_at,
          deleted_at,
          created_at,
          updated_at
        FROM tasks
        WHERE is_recurring = 1
          AND status IN ('active', 'overdue')
          AND due_at < ?
        ORDER BY due_at ASC
      `,
      referenceAt
    );

    return rows.map(mapTask);
  }

  async searchTasks(query: TaskSearchQuery): Promise<TaskListItem[]> {
    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (!query.statuses || query.statuses.length === 0) {
      conditions.push(`tasks.status != 'trashed'`);
    }

    if (query.keyword) {
      conditions.push(`(tasks.title LIKE ? OR tasks.note LIKE ? OR COALESCE(categories.name, '') LIKE ?)`);
      values.push(`%${query.keyword}%`, `%${query.keyword}%`, `%${query.keyword}%`);
    }

    if (query.statuses && query.statuses.length > 0) {
      const placeholders = query.statuses.map(() => '?').join(', ');
      conditions.push(`tasks.status IN (${placeholders})`);
      values.push(...query.statuses);
    }

    if (query.categoryIds && query.categoryIds.length > 0) {
      const includesUncategorized = query.categoryIds.includes('__uncategorized__');
      const explicitCategoryIds = query.categoryIds.filter(
        (categoryId) => categoryId !== '__uncategorized__'
      );

      if (explicitCategoryIds.length > 0 && includesUncategorized) {
        const placeholders = explicitCategoryIds.map(() => '?').join(', ');
        conditions.push(`(tasks.category_id IN (${placeholders}) OR tasks.category_id IS NULL)`);
        values.push(...explicitCategoryIds);
      } else if (explicitCategoryIds.length > 0) {
        const placeholders = explicitCategoryIds.map(() => '?').join(', ');
        conditions.push(`tasks.category_id IN (${placeholders})`);
        values.push(...explicitCategoryIds);
      } else if (includesUncategorized) {
        conditions.push(`tasks.category_id IS NULL`);
      }
    }

    if (query.priority && query.priority.length > 0) {
      const placeholders = query.priority.map(() => '?').join(', ');
      conditions.push(`tasks.priority IN (${placeholders})`);
      values.push(...query.priority);
    }

    if (query.hasReminder !== undefined) {
      conditions.push(
        query.hasReminder
          ? `EXISTS (
              SELECT 1
              FROM task_reminders AS reminder_filter
              WHERE reminder_filter.task_id = tasks.id
                AND reminder_filter.reminder_type = 'normal'
            )`
          : `NOT EXISTS (
              SELECT 1
              FROM task_reminders AS reminder_filter
              WHERE reminder_filter.task_id = tasks.id
                AND reminder_filter.reminder_type = 'normal'
            )`
      );
    }

    if (query.isRecurring !== undefined) {
      conditions.push(`tasks.is_recurring = ?`);
      values.push(query.isRecurring ? 1 : 0);
    }

    if (query.dateFrom) {
      conditions.push(`tasks.due_at >= ?`);
      values.push(query.dateFrom);
    }

    if (query.dateTo) {
      conditions.push(`tasks.due_at <= ?`);
      values.push(query.dateTo);
    }

    return this.getTaskListItems(
      conditions.join(' AND '),
      values,
      buildSearchOrderBy(query.sortBy, query.sortOrder)
    );
  }

  async getTasksForHomeView(view: HomeViewType): Promise<TaskListItem[]> {
    switch (view) {
      case 'today': {
        const today = new Date().toISOString().slice(0, 10);
        return this.getTaskListItems(
          `tasks.status IN ('active', 'overdue') AND substr(tasks.due_at, 1, 10) = ?`,
          [today]
        );
      }
      case 'upcoming':
        return this.getTaskListItems(
          `tasks.status = 'active' AND tasks.due_at > ?`,
          [new Date().toISOString()],
          `tasks.due_at ASC, CASE tasks.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, tasks.created_at DESC`
        );
      case 'overdue':
        return this.getTaskListItems(`tasks.status = 'overdue'`, []);
      case 'by_category':
        return this.getTaskListItems(
          `tasks.status IN ('active', 'overdue')`,
          [],
          `COALESCE(categories.name, 'Uncategorized') COLLATE NOCASE ASC, tasks.due_at ASC, CASE tasks.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END`
        );
      case 'by_priority':
        return this.getTaskListItems(
          `tasks.status IN ('active', 'overdue')`,
          [],
          `CASE tasks.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, tasks.due_at ASC, tasks.created_at DESC`
        );
      case 'all':
      default:
        return this.getTaskListItems(`tasks.status IN ('active', 'overdue')`, []);
    }
  }

  async getExpiredTrashTasks(beforeAt: string): Promise<Task[]> {
    const rows = await this.database.getAllAsync<TaskRow>(
      `
        SELECT
          id,
          title,
          note,
          due_at,
          category_id,
          priority,
          status,
          is_recurring,
          recurrence_type,
          recurrence_interval,
          recurrence_generate_mode,
          parent_task_id,
          completed_at,
          deleted_at,
          created_at,
          updated_at
        FROM tasks
        WHERE status = 'trashed' AND deleted_at <= ?
      `,
      beforeAt
    );

    return rows.map(mapTask);
  }

  async refreshTaskStatuses(referenceAt: string): Promise<void> {
    await this.database.withTransactionAsync(async () => {
      await this.database.runAsync(
        `
          UPDATE tasks
          SET status = 'overdue', updated_at = ?
          WHERE status = 'active' AND due_at < ?
        `,
        referenceAt,
        referenceAt
      );

      await this.database.runAsync(
        `
          UPDATE tasks
          SET status = 'active', updated_at = ?
          WHERE status = 'overdue' AND due_at >= ?
        `,
        referenceAt,
        referenceAt
      );
    });
  }

  private async getTaskListItems(
    whereClause: string,
    values: (string | number)[],
    orderBy = `CASE tasks.status WHEN 'overdue' THEN 0 ELSE 1 END,
          tasks.due_at ASC,
          CASE tasks.priority
            WHEN 'high' THEN 0
            WHEN 'medium' THEN 1
            ELSE 2
          END,
          tasks.created_at DESC`
  ) {
    const safeWhereClause = whereClause.trim() ? whereClause : `1 = 1`;
    const rows = await this.database.getAllAsync<TaskRow>(
      `
        SELECT
          tasks.id,
          tasks.title,
          tasks.note,
          tasks.due_at,
          tasks.category_id,
          tasks.priority,
          tasks.status,
          tasks.is_recurring,
          tasks.recurrence_type,
          tasks.recurrence_interval,
          tasks.recurrence_generate_mode,
          tasks.parent_task_id,
          tasks.completed_at,
          tasks.deleted_at,
          tasks.created_at,
          tasks.updated_at,
          categories.name AS category_name,
          COUNT(DISTINCT task_reminders.id) AS reminder_count,
          COUNT(DISTINCT CASE WHEN task_sub_items.is_completed = 0 THEN task_sub_items.id END) AS incomplete_sub_task_count
        FROM tasks
        LEFT JOIN categories ON categories.id = tasks.category_id
        LEFT JOIN task_reminders ON task_reminders.task_id = tasks.id
        LEFT JOIN task_sub_items ON task_sub_items.task_id = tasks.id
        WHERE ${safeWhereClause}
        GROUP BY tasks.id
        ORDER BY ${orderBy}
      `,
      ...values
    );

    return rows.map(mapTaskListItem);
  }
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    note: row.note ?? undefined,
    dueAt: row.due_at,
    categoryId: row.category_id,
    priority: row.priority,
    status: row.status,
    isRecurring: row.is_recurring === 1,
    recurrenceType: row.recurrence_type ?? null,
    recurrenceInterval: row.recurrence_interval,
    recurrenceGenerateMode: row.recurrence_generate_mode ?? null,
    parentTaskId: row.parent_task_id,
    completedAt: row.completed_at,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTaskListItem(row: TaskRow): TaskListItem {
  return {
    ...mapTask(row),
    categoryName: row.category_name ?? null,
    reminderCount: row.reminder_count ?? 0,
    incompleteSubTaskCount: row.incomplete_sub_task_count ?? 0,
  };
}

function buildSearchOrderBy(
  sortBy: TaskSearchQuery['sortBy'],
  sortOrder: TaskSearchQuery['sortOrder']
) {
  const direction = sortOrder === 'desc' ? 'DESC' : 'ASC';

  switch (sortBy) {
    case 'createdAt':
      return `tasks.created_at ${direction}, tasks.due_at ASC`;
    case 'updatedAt':
      return `tasks.updated_at ${direction}, tasks.due_at ASC`;
    case 'priority':
      return `CASE tasks.priority
        WHEN 'high' THEN 0
        WHEN 'medium' THEN 1
        ELSE 2
      END ${direction}, tasks.due_at ASC`;
    case 'category':
      return `COALESCE(categories.name, 'Uncategorized') COLLATE NOCASE ${direction}, tasks.due_at ASC`;
    case 'dueAt':
    default:
      return `tasks.due_at ${direction},
        CASE tasks.priority
          WHEN 'high' THEN 0
          WHEN 'medium' THEN 1
          ELSE 2
        END ASC,
        tasks.created_at DESC`;
  }
}
