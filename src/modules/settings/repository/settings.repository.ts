import { type AppSetting } from '@/modules/settings/domain/app-setting.types';

export interface SettingsRepository {
  getSettings(): Promise<AppSetting>;
  updateSettings(input: Partial<AppSetting>): Promise<void>;
}
