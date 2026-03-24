export interface AppSetting {
  id: 'default';
  notificationsEnabled: boolean;
  defaultReminderJson?: string | null;
  themeMode: 'light' | 'dark' | 'system';
  defaultSort: string;
  dailySummaryEnabled: boolean;
  dailySummaryTime?: string | null;
  onboardingCompleted: boolean;
  updatedAt: string;
}
