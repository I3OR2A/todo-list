import { ThemeProvider } from '@react-navigation/native';
import { SQLiteProvider, type SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import { Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { CompletionCelebrationOverlay } from '@/components/app/completion-celebration-overlay';
import { getAppThemes } from '@/constants/paper-theme';
import { APP_DATABASE_NAME } from '@/database/client/constants';
import { CompletionCelebrationProvider } from '@/modules/app/context/completion-celebration-context';
import { configureNotificationHandler } from '@/modules/notification/services/local-notification.service';
import { initializeAppDatabase } from '@/modules/app/usecases/initialize-app-database';
import { ThemeModeProvider } from '@/modules/settings/context/theme-mode-context';
import { type AppSetting } from '@/modules/settings/domain/app-setting.types';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';

export default function RootLayout() {
  useEffect(() => {
    configureNotificationHandler();
  }, []);

  const handleDatabaseInit = useCallback(async (database: SQLiteDatabase) => {
    await initializeAppDatabase(database);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName={APP_DATABASE_NAME} onInit={handleDatabaseInit}>
        <AppProviders />
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

function AppProviders() {
  const database = useSQLiteContext();
  const systemScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [themeMode, setThemeMode] = useState<AppSetting['themeMode']>('system');
  const [celebrationMessage, setCelebrationMessage] = useState('Task finished and moved to Completed.');
  const [celebrationToken, setCelebrationToken] = useState(0);
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  useEffect(() => {
    async function loadThemeMode() {
      const repository = new SQLiteSettingsRepository(database);
      const settings = await repository.getSettings();
      setThemeMode(settings.themeMode);
    }

    loadThemeMode();
  }, [database]);

  const effectiveScheme = themeMode === 'system' ? systemScheme : themeMode;
  const { navigationTheme, paperTheme } = getAppThemes(effectiveScheme);

  const showCelebration = useCallback((message = 'Task finished and moved to Completed.') => {
    setCelebrationMessage(message);
    setCelebrationToken((currentToken) => currentToken + 1);
    setCelebrationVisible(true);
  }, []);

  useEffect(() => {
    if (!celebrationVisible) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setCelebrationVisible(false);
    }, 1300);

    return () => clearTimeout(timeoutId);
  }, [celebrationToken, celebrationVisible]);

  return (
    <CompletionCelebrationProvider value={{ showCelebration }}>
      <ThemeModeProvider value={{ themeMode, setThemeMode }}>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navigationTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding/index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="task/create" />
              <Stack.Screen name="task/[taskId]/index" />
              <Stack.Screen name="task/[taskId]/edit" />
              <Stack.Screen name="categories/index" />
              <Stack.Screen name="trash/index" />
              <Stack.Screen name="export/index" />
              <Stack.Screen name="modal/filter" options={{ presentation: 'modal' }} />
              <Stack.Screen name="modal/sort" options={{ presentation: 'modal' }} />
              <Stack.Screen name="modal/category-picker" options={{ presentation: 'modal' }} />
              <Stack.Screen name="modal/reminder-picker" options={{ presentation: 'modal' }} />
            </Stack>
            <CompletionCelebrationOverlay
              message={celebrationMessage}
              token={celebrationToken}
              visible={celebrationVisible}
            />
          </ThemeProvider>
        </PaperProvider>
      </ThemeModeProvider>
    </CompletionCelebrationProvider>
  );
}
