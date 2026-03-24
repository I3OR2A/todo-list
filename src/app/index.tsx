import { Redirect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useState } from 'react';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { LoadingScreen } from '@/components/app/loading-screen';
import { prepareAppLaunch } from '@/modules/app/usecases/prepare-app-launch';

type StartupRoute = '/onboarding' | '/(tabs)/home';

export default function AppEntryScreen() {
  const database = useSQLiteContext();
  const [targetRoute, setTargetRoute] = useState<StartupRoute | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStartupRoute = useCallback(async () => {
    try {
      setError(null);
      setTargetRoute(null);

      const settings = await prepareAppLaunch(database);
      setTargetRoute(settings.onboardingCompleted ? '/(tabs)/home' : '/onboarding');
    } catch (startupError) {
      const message =
        startupError instanceof Error ? startupError.message : 'Failed to prepare app launch.';
      setError(message);
    }
  }, [database]);

  useEffect(() => {
    loadStartupRoute();
  }, [loadStartupRoute]);

  if (error) {
    return (
      <ErrorStateScreen
        title="Unable to start the app"
        message={error}
        retryLabel="Retry launch"
        onRetry={loadStartupRoute}
      />
    );
  }

  if (!targetRoute) {
    return (
      <LoadingScreen
        title="Preparing Cute Todo App"
        message="Loading local settings, cleanup jobs, and startup state."
      />
    );
  }

  return <Redirect href={targetRoute} />;
}
