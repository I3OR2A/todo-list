export const INITIAL_SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    note TEXT,
    due_at TEXT NOT NULL,
    category_id TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT NOT NULL CHECK (status IN ('active', 'overdue', 'completed', 'trashed')),
    is_recurring INTEGER NOT NULL DEFAULT 0 CHECK (is_recurring IN (0, 1)),
    recurrence_type TEXT,
    recurrence_interval INTEGER,
    recurrence_generate_mode TEXT,
    parent_task_id TEXT,
    completed_at TEXT,
    deleted_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS index_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS index_tasks_due_at ON tasks(due_at);
  CREATE INDEX IF NOT EXISTS index_tasks_category_id ON tasks(category_id);
  CREATE INDEX IF NOT EXISTS index_tasks_priority ON tasks(priority);
  CREATE INDEX IF NOT EXISTS index_tasks_deleted_at ON tasks(deleted_at);
  CREATE INDEX IF NOT EXISTS index_tasks_parent_task_id ON tasks(parent_task_id);

  CREATE TABLE IF NOT EXISTS task_sub_items (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT NOT NULL,
    title TEXT NOT NULL,
    is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS index_sub_items_task_id ON task_sub_items(task_id);
  CREATE INDEX IF NOT EXISTS index_sub_items_task_id_completed ON task_sub_items(task_id, is_completed);

  CREATE TABLE IF NOT EXISTS task_reminders (
    id TEXT PRIMARY KEY NOT NULL,
    task_id TEXT NOT NULL,
    remind_at TEXT NOT NULL,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('normal', 'overdue')),
    notification_request_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS index_task_reminders_task_id ON task_reminders(task_id);
  CREATE INDEX IF NOT EXISTS index_task_reminders_remind_at ON task_reminders(remind_at);

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS unique_categories_name ON categories(name);
  CREATE INDEX IF NOT EXISTS index_categories_sort_order ON categories(sort_order);

  CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY NOT NULL,
    notifications_enabled INTEGER NOT NULL DEFAULT 1 CHECK (notifications_enabled IN (0, 1)),
    default_reminder_json TEXT,
    theme_mode TEXT NOT NULL CHECK (theme_mode IN ('light', 'dark', 'system')),
    default_sort TEXT NOT NULL,
    daily_summary_enabled INTEGER NOT NULL DEFAULT 0 CHECK (daily_summary_enabled IN (0, 1)),
    daily_summary_time TEXT,
    onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_completed IN (0, 1)),
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS export_logs (
    id TEXT PRIMARY KEY NOT NULL,
    export_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`;
