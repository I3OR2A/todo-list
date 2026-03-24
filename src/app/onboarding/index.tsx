import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { InfoCard } from '@/components/app/info-card';
import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';
import { OnboardingPageCard } from '@/components/onboarding/onboarding-page-card';
import { Spacing } from '@/constants/theme';
import {
  getNotificationPermissions,
  requestNotificationPermissions,
} from '@/modules/notification/services/local-notification.service';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';

const ONBOARDING_PAGES = [
  {
    body: 'Cute Todo keeps planning local, fast, and calm. Capture what matters without accounts or cloud setup.',
    bullets: [
      'Everything works offline with local SQLite storage.',
      'Home keeps active work visible while completed and trash stay separate.',
      'The app focuses on iPhone-first flows and lightweight interactions.',
    ],
    title: 'A calm local planner',
  },
  {
    body: 'Create tasks with title, due time, priority, subtasks, recurrence, and reminders in one flow.',
    bullets: [
      'Start from Home with Create task.',
      'Use subtasks to break work down.',
      'Recurring tasks generate the next item automatically when completed.',
    ],
    title: 'Create your first task',
  },
  {
    body: 'Categories help you group life areas, while reminders keep tasks visible before they slip.',
    bullets: [
      'Categories support color, icon, and task counts.',
      'Tasks can keep multiple reminders.',
      'Search supports category, reminder, and recurrence filters later on.',
    ],
    title: 'Organize with categories and reminders',
  },
  {
    body: 'Notifications are optional, but they unlock task reminders and daily summaries.',
    bullets: [
      'You can enable notifications now or later from Settings.',
      'Overdue tasks can trigger reminder scheduling.',
      'Daily summary reminders use your preferred time.',
    ],
    title: 'Enable notifications',
  },
] as const;

export default function OnboardingScreen() {
  const database = useSQLiteContext();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    async function loadPermissionState() {
      const permission = await getNotificationPermissions();
      setPermissionGranted(permission.granted);
    }

    loadPermissionState();
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      setError(null);
      setIsSubmitting(true);

      const repository = new SQLiteSettingsRepository(database);
      await repository.updateSettings({ onboardingCompleted: true });
      router.replace('/(tabs)/home');
    } catch (completionError) {
      const message =
        completionError instanceof Error
          ? completionError.message
          : 'Failed to update onboarding state.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [database]);

  const handleRequestNotifications = useCallback(async () => {
    try {
      setError(null);
      const permission = await requestNotificationPermissions();
      setPermissionGranted(permission.granted);

      const repository = new SQLiteSettingsRepository(database);
      await repository.updateSettings({
        notificationsEnabled: permission.granted,
      });
    } catch (permissionError) {
      const message =
        permissionError instanceof Error
          ? permissionError.message
          : 'Failed to request notification permissions.';
      setError(message);
    }
  }, [database]);

  if (error) {
    return (
      <ErrorStateScreen
        title="Unable to finish onboarding"
        message={error}
        retryLabel="Retry onboarding"
        onRetry={completeOnboarding}
      />
    );
  }

  const isLastPage = pageIndex === ONBOARDING_PAGES.length - 1;
  const currentPage = ONBOARDING_PAGES[pageIndex];

  return (
    <ScreenShell
      title="Welcome"
      subtitle="A short four-step walkthrough before entering your local task space."
      footer={
        <>
          <View style={styles.footerRow}>
            {pageIndex > 0 ? (
              <PrimaryButton
                label="Back"
                onPress={() => setPageIndex((currentIndex) => currentIndex - 1)}
                variant="secondary"
              />
            ) : null}
            {!isLastPage ? (
              <PrimaryButton
                label="Next"
                onPress={() => setPageIndex((currentIndex) => currentIndex + 1)}
              />
            ) : null}
          </View>
          {isLastPage ? (
            <>
              <PrimaryButton
                label="Enable Notifications"
                variant="secondary"
                onPress={handleRequestNotifications}
              />
              <PrimaryButton
                label={isSubmitting ? 'Saving...' : 'Start using Cute Todo'}
                disabled={isSubmitting}
                onPress={completeOnboarding}
              />
            </>
          ) : (
            <PrimaryButton
              label="Skip walkthrough"
              variant="secondary"
              onPress={completeOnboarding}
            />
          )}
        </>
      }>
      <InfoCard>
        <View style={styles.pageIndicatorRow}>
          {ONBOARDING_PAGES.map((page, index) => (
            <Chip key={page.title} compact mode={index === pageIndex ? 'flat' : 'outlined'}>
              {index + 1}
            </Chip>
          ))}
        </View>
      </InfoCard>

      <OnboardingPageCard
        body={currentPage.body}
        bullets={[...currentPage.bullets]}
        index={pageIndex}
        title={currentPage.title}
      />

      <InfoCard>
        <Text variant="titleMedium">Notification status</Text>
        <Text variant="bodyLarge">
          Reminders and daily summary alerts only work after notification permission is granted.
        </Text>
        <Text variant="bodyMedium">
          Notification permission:{' '}
          {permissionGranted === null ? 'Checking...' : permissionGranted ? 'Granted' : 'Not granted'}
        </Text>
      </InfoCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pageIndicatorRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
});
