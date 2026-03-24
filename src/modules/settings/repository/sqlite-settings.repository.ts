import { type SQLiteDatabase } from 'expo-sqlite';

import { SETTINGS_RECORD_ID } from '@/database/client/constants';
import { DEFAULT_APP_SETTINGS } from '@/modules/settings/domain/default-settings';
import { type AppSetting } from '@/modules/settings/domain/app-setting.types';
import { type SettingsRepository } from '@/modules/settings/repository/settings.repository';

type AppSettingsRow = {
  id: 'default';
  notifications_enabled: number;
  default_reminder_json: string | null;
  theme_mode: 'light' | 'dark' | 'system';
  default_sort: string;
  daily_summary_enabled: number;
  daily_summary_time: string | null;
  onboarding_completed: number;
  updated_at: string;
};

const FIELD_TO_COLUMN = {
  notificationsEnabled: 'notifications_enabled',
  defaultReminderJson: 'default_reminder_json',
  themeMode: 'theme_mode',
  defaultSort: 'default_sort',
  dailySummaryEnabled: 'daily_summary_enabled',
  dailySummaryTime: 'daily_summary_time',
  onboardingCompleted: 'onboarding_completed',
  updatedAt: 'updated_at',
} as const;

export class SQLiteSettingsRepository implements SettingsRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async getSettings(): Promise<AppSetting> {
    const row = await this.database.getFirstAsync<AppSettingsRow>(
      `
        SELECT
          id,
          notifications_enabled,
          default_reminder_json,
          theme_mode,
          default_sort,
          daily_summary_enabled,
          daily_summary_time,
          onboarding_completed,
          updated_at
        FROM app_settings
        WHERE id = ?
      `,
      SETTINGS_RECORD_ID
    );

    if (!row) {
      return {
        ...DEFAULT_APP_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
    }

    return mapAppSettingsRow(row);
  }

  async updateSettings(input: Partial<AppSetting>): Promise<void> {
    const entries = Object.entries(input).filter(
      ([key, value]) => key !== 'id' && value !== undefined
    ) as [keyof typeof FIELD_TO_COLUMN, AppSetting[keyof AppSetting]][];

    if (entries.length === 0) {
      return;
    }

    const assignments = entries.map(([fieldName]) => `${FIELD_TO_COLUMN[fieldName]} = ?`);
    const values = entries.map(([fieldName, value]) =>
      serializeSettingValue(fieldName, value)
    );

    assignments.push(`${FIELD_TO_COLUMN.updatedAt} = ?`);
    values.push(new Date().toISOString());

    await this.database.runAsync(
      `
        UPDATE app_settings
        SET ${assignments.join(', ')}
        WHERE id = ?
      `,
      ...values,
      SETTINGS_RECORD_ID
    );
  }
}

function serializeSettingValue(
  fieldName: keyof typeof FIELD_TO_COLUMN,
  value: AppSetting[keyof AppSetting]
) {
  if (fieldName === 'notificationsEnabled' || fieldName === 'dailySummaryEnabled') {
    return value ? 1 : 0;
  }

  if (fieldName === 'onboardingCompleted') {
    return value ? 1 : 0;
  }

  return value ?? null;
}

function mapAppSettingsRow(row: AppSettingsRow): AppSetting {
  return {
    id: row.id,
    notificationsEnabled: row.notifications_enabled === 1,
    defaultReminderJson: row.default_reminder_json,
    themeMode: row.theme_mode,
    defaultSort: row.default_sort,
    dailySummaryEnabled: row.daily_summary_enabled === 1,
    dailySummaryTime: row.daily_summary_time,
    onboardingCompleted: row.onboarding_completed === 1,
    updatedAt: row.updated_at,
  };
}
