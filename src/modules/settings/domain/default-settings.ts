import { type AppSetting } from '@/modules/settings/domain/app-setting.types';

export const DEFAULT_APP_SETTINGS: AppSetting = {
  id: 'default',
  notificationsEnabled: true,
  defaultReminderJson: null,
  themeMode: 'system',
  defaultSort: 'dueAt',
  dailySummaryEnabled: false,
  dailySummaryTime: null,
  onboardingCompleted: false,
  updatedAt: '',
};
