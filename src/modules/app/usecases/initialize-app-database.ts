import { type SQLiteDatabase } from 'expo-sqlite';

import { SETTINGS_RECORD_ID } from '@/database/client/constants';
import { runMigrations } from '@/database/migrations/run-migrations';

export async function initializeAppDatabase(database: SQLiteDatabase) {
  await runMigrations(database);
  await ensureDefaultSettings(database);
}

async function ensureDefaultSettings(database: SQLiteDatabase) {
  const now = new Date().toISOString();

  await database.runAsync(
    `
      INSERT OR IGNORE INTO app_settings (
        id,
        notifications_enabled,
        default_reminder_json,
        theme_mode,
        default_sort,
        daily_summary_enabled,
        daily_summary_time,
        onboarding_completed,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    SETTINGS_RECORD_ID,
    1,
    null,
    'system',
    'dueAt',
    0,
    null,
    0,
    now
  );
}
