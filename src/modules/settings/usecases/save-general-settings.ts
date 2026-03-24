import { type SQLiteDatabase } from 'expo-sqlite';

import { type AppSetting } from '@/modules/settings/domain/app-setting.types';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';

export async function saveGeneralSettings(
  database: SQLiteDatabase,
  input: Pick<AppSetting, 'defaultSort' | 'themeMode'>
) {
  const settingsRepository = new SQLiteSettingsRepository(database);
  await settingsRepository.updateSettings(input);
  return settingsRepository.getSettings();
}
