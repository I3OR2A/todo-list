import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { InfoCard } from '@/components/app/info-card';
import { LoadingScreen } from '@/components/app/loading-screen';
import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';
import { TaskSection } from '@/components/task/task-section';
import { ThemedText } from '@/components/themed-text';
import { clearCompletedTasks } from '@/modules/task/usecases/clear-completed-tasks';
import { listCompletedTasks } from '@/modules/task/usecases/list-completed-tasks';

export default function CompletedScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const [tasks, setTasks] = useState<Awaited<ReturnType<typeof listCompletedTasks>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      setTasks(await listCompletedTasks(database));
    } catch (completedError) {
      const message =
        completedError instanceof Error ? completedError.message : 'Failed to load completed tasks.';
      setError(message);
    }
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const handleClearCompleted = useCallback(async () => {
    try {
      await clearCompletedTasks(database);
      await loadTasks();
    } catch (clearError) {
      const message =
        clearError instanceof Error ? clearError.message : 'Failed to clear completed tasks.';
      setError(message);
    }
  }, [database, loadTasks]);

  if (error) {
    return (
      <ErrorStateScreen
        title="Unable to load completed tasks"
        message={error}
        retryLabel="Retry completed"
        onRetry={loadTasks}
      />
    );
  }

  if (!tasks) {
    return (
      <LoadingScreen
        title="Loading completed tasks"
        message="Fetching completed tasks from local storage."
      />
    );
  }

  return (
    <ScreenShell
      title="Completed"
      subtitle="Completed tasks stay here until you explicitly clear them."
      footer={
        tasks.length > 0 ? (
          <PrimaryButton label="Clear completed" onPress={handleClearCompleted} variant="secondary" />
        ) : undefined
      }>
      {tasks.length === 0 ? (
        <InfoCard>
          <ThemedText type="smallBold">Nothing completed yet</ThemedText>
          <ThemedText themeColor="textSecondary">
            Completed tasks will show up here after you finish them from Home or Task Details.
          </ThemedText>
        </InfoCard>
      ) : (
        <TaskSection
          onTaskPress={(taskId) =>
            router.push({
              pathname: '/task/[taskId]',
              params: { taskId },
            })
          }
          section={{ title: 'Completed Tasks', items: tasks }}
        />
      )}
    </ScreenShell>
  );
}
