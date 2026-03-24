import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Chip, Switch, Text, TextInput } from 'react-native-paper';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { InfoCard } from '@/components/app/info-card';
import { LoadingScreen } from '@/components/app/loading-screen';
import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';
import { Spacing } from '@/constants/theme';
import { getNotificationPermissions } from '@/modules/notification/services/local-notification.service';
import { useThemeModeController } from '@/modules/settings/context/theme-mode-context';
import { type AppSetting } from '@/modules/settings/domain/app-setting.types';
import {
  DEFAULT_REMINDER_OPTIONS,
  parseDefaultReminderJson,
  serializeDefaultReminder,
  type DefaultReminderSetting,
} from '@/modules/settings/domain/default-reminder';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';
import { saveGeneralSettings } from '@/modules/settings/usecases/save-general-settings';
import { saveNotificationSettings } from '@/modules/settings/usecases/save-notification-settings';

type SettingsFormState = {
  defaultSort: string;
  dailySummaryEnabled: boolean;
  dailySummaryTime: string;
  defaultReminder: DefaultReminderSetting | null;
  notificationsEnabled: boolean;
  themeMode: AppSetting['themeMode'];
};

export default function SettingsScreen() {
  const database = useSQLiteContext();
  const { setThemeMode } = useThemeModeController();
  const [settings, setSettings] = useState<AppSetting | null>(null);
  const [formState, setFormState] = useState<SettingsFormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setError(null);
      const repository = new SQLiteSettingsRepository(database);
      const [nextSettings, permission] = await Promise.all([
        repository.getSettings(),
        getNotificationPermissions(),
      ]);
      setSettings(nextSettings);
      setFormState({
        defaultSort: nextSettings.defaultSort,
        dailySummaryEnabled: nextSettings.dailySummaryEnabled,
        dailySummaryTime: nextSettings.dailySummaryTime ?? '09:00',
        defaultReminder: parseDefaultReminderJson(nextSettings.defaultReminderJson),
        notificationsEnabled: nextSettings.notificationsEnabled,
        themeMode: nextSettings.themeMode,
      });
      setPermissionGranted(permission.granted);
    } catch (settingsError) {
      const message =
        settingsError instanceof Error ? settingsError.message : 'Failed to load app settings.';
      setError(message);
    }
  }, [database]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (error) {
    return (
      <ErrorStateScreen
        title="Unable to load settings"
        message={error}
        retryLabel="Retry settings"
        onRetry={loadSettings}
      />
    );
  }

  if (!settings) {
    return (
      <LoadingScreen
        title="Loading settings"
        message="Reading the seeded app settings from SQLite."
      />
    );
  }

  async function handleSave() {
    if (!formState) {
      return;
    }

    const isValidTime = /^\d{2}:\d{2}$/.test(formState.dailySummaryTime.trim());

    if (formState.dailySummaryEnabled && !isValidTime) {
      setError('Daily summary time must use HH:mm format.');
      return;
    }

    try {
      setError(null);
      setIsSaving(true);
      const result = await saveNotificationSettings(database, {
        dailySummaryEnabled: formState.notificationsEnabled
          ? formState.dailySummaryEnabled
          : false,
        dailySummaryTime: formState.dailySummaryTime.trim(),
        defaultReminderJson: serializeDefaultReminder(formState.defaultReminder),
        notificationsEnabled: formState.notificationsEnabled,
      });
      const permission = await getNotificationPermissions();
      setPermissionGranted(permission.granted);
      setSettings(result.settings);
      setFormState({
        defaultSort: result.settings.defaultSort,
        dailySummaryEnabled: result.settings.dailySummaryEnabled,
        dailySummaryTime: result.settings.dailySummaryTime ?? '09:00',
        defaultReminder: parseDefaultReminderJson(result.settings.defaultReminderJson),
        notificationsEnabled: result.settings.notificationsEnabled,
        themeMode: result.settings.themeMode,
      });

      if (!result.granted) {
        setError('Notification permission was not granted. Open iPhone Settings to enable reminders.');
      }
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save settings.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveAppearance() {
    if (!formState) {
      return;
    }

    try {
      setError(null);
      setIsSaving(true);
      const nextSettings = await saveGeneralSettings(database, {
        defaultSort: formState.defaultSort,
        themeMode: formState.themeMode,
      });
      setThemeMode(nextSettings.themeMode);
      setSettings(nextSettings);
      setFormState((currentState) =>
        currentState
          ? {
              ...currentState,
              defaultSort: nextSettings.defaultSort,
              themeMode: nextSettings.themeMode,
            }
          : currentState
      );
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save appearance settings.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenShell
      title="Settings"
      subtitle="Manage notification access, default reminder preferences, and the daily summary schedule.">
      {error ? (
        <InfoCard>
          <Text variant="bodyLarge">{error}</Text>
        </InfoCard>
      ) : null}

      <InfoCard>
        <Text variant="titleMedium">Notification settings</Text>
        <View style={styles.switchRow}>
          <Text variant="bodyLarge">Notifications enabled</Text>
          <Switch
            value={formState?.notificationsEnabled ?? false}
            onValueChange={(notificationsEnabled) =>
              setFormState((currentState) =>
                currentState
                  ? {
                      ...currentState,
                      notificationsEnabled,
                    }
                  : currentState
              )
            }
          />
        </View>
        <Text style={styles.value} variant="bodyLarge">
          Permission:{' '}
          {permissionGranted === null ? 'Checking...' : permissionGranted ? 'Granted' : 'Not granted'}
        </Text>
        <PrimaryButton
          label="Open iPhone Settings"
          variant="secondary"
          onPress={() => Linking.openSettings()}
        />
      </InfoCard>

      <InfoCard>
        <Text variant="titleMedium">Default reminder</Text>
        <View style={styles.chipGroup}>
          <Chip
            mode={formState?.defaultReminder ? 'outlined' : 'flat'}
            onPress={() =>
              setFormState((currentState) =>
                currentState
                  ? {
                      ...currentState,
                      defaultReminder: null,
                    }
                  : currentState
              )
            }>
            None
          </Chip>
          {DEFAULT_REMINDER_OPTIONS.map((option) => (
            <Chip
              key={option.minutesBefore}
              mode={
                formState?.defaultReminder?.minutesBefore === option.minutesBefore
                  ? 'flat'
                  : 'outlined'
              }
              onPress={() =>
                setFormState((currentState) =>
                  currentState
                    ? {
                        ...currentState,
                        defaultReminder: option,
                      }
                    : currentState
                )
              }>
              {option.minutesBefore} min before
            </Chip>
          ))}
        </View>
      </InfoCard>

      <InfoCard>
        <Text variant="titleMedium">Daily summary</Text>
        <View style={styles.switchRow}>
          <Text variant="bodyLarge">Enable daily summary</Text>
          <Switch
            disabled={!(formState?.notificationsEnabled ?? false)}
            value={formState?.dailySummaryEnabled ?? false}
            onValueChange={(dailySummaryEnabled) =>
              setFormState((currentState) =>
                currentState
                  ? {
                      ...currentState,
                      dailySummaryEnabled,
                    }
                  : currentState
              )
            }
          />
        </View>
        <TextInput
          autoCapitalize="none"
          disabled={!(formState?.dailySummaryEnabled ?? false)}
          label="Daily summary time"
          mode="outlined"
          placeholder="09:00"
          value={formState?.dailySummaryTime ?? ''}
          onChangeText={(dailySummaryTime) =>
            setFormState((currentState) =>
              currentState
                ? {
                    ...currentState,
                    dailySummaryTime,
                  }
                : currentState
            )
          }
        />
      </InfoCard>

      <InfoCard>
        <Text variant="titleMedium">Appearance and defaults</Text>
        <Text variant="labelLarge">Theme mode</Text>
        <View style={styles.chipGroup}>
          {(['light', 'dark', 'system'] as const).map((option) => (
            <Chip
              key={option}
              mode={formState?.themeMode === option ? 'flat' : 'outlined'}
              onPress={() =>
                setFormState((currentState) =>
                  currentState
                    ? {
                        ...currentState,
                        themeMode: option,
                      }
                    : currentState
                )
              }>
              {option}
            </Chip>
          ))}
        </View>
        <Text variant="labelLarge">Default sort</Text>
        <View style={styles.chipGroup}>
          {['dueAt', 'createdAt', 'updatedAt', 'priority', 'category'].map((option) => (
            <Chip
              key={option}
              mode={formState?.defaultSort === option ? 'flat' : 'outlined'}
              onPress={() =>
                setFormState((currentState) =>
                  currentState
                    ? {
                        ...currentState,
                        defaultSort: option,
                      }
                    : currentState
                )
              }>
              {option}
            </Chip>
          ))}
        </View>
        <Text style={styles.value} variant="bodyLarge">
          Onboarding completed: {String(settings.onboardingCompleted)}
        </Text>
        <PrimaryButton
          label={isSaving ? 'Saving...' : 'Save appearance'}
          disabled={isSaving}
          onPress={handleSaveAppearance}
        />
      </InfoCard>

      <PrimaryButton
        label={isSaving ? 'Saving...' : 'Save settings'}
        disabled={isSaving}
        onPress={handleSave}
      />

      <Link href="/categories" asChild>
        <PrimaryButton label="Open Categories" variant="secondary" />
      </Link>
      <Link href="/trash" asChild>
        <PrimaryButton label="Open Trash" variant="secondary" />
      </Link>
      <Link href="/export" asChild>
        <PrimaryButton label="Open Export" variant="secondary" />
      </Link>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  value: {
    lineHeight: 22,
    marginTop: Spacing.one,
  },
});
