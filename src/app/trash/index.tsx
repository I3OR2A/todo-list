import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { InfoCard } from '@/components/app/info-card';
import { LoadingScreen } from '@/components/app/loading-screen';
import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';
import { TaskSection } from '@/components/task/task-section';
import { ThemedText } from '@/components/themed-text';
import { cleanupTrash } from '@/modules/task/usecases/cleanup-trash';
import { listTrashTasks } from '@/modules/task/usecases/list-trash-tasks';
import { permanentlyDeleteTask } from '@/modules/task/usecases/permanently-delete-task';

export default function TrashScreen() {
  const database = useSQLiteContext();
  const [tasks, setTasks] = useState<Awaited<ReturnType<typeof listTrashTasks>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      await cleanupTrash(database);
      setTasks(await listTrashTasks(database));
    } catch (trashError) {
      const message = trashError instanceof Error ? trashError.message : 'Failed to load trash.';
      setError(message);
    }
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        await permanentlyDeleteTask(database, taskId);
        await loadTasks();
      } catch (deleteError) {
        const message =
          deleteError instanceof Error ? deleteError.message : 'Failed to permanently delete task.';
        setError(message);
      }
    },
    [database, loadTasks]
  );

  if (error) {
    return (
      <ErrorStateScreen
        title="Unable to load trash"
        message={error}
        retryLabel="Retry trash"
        onRetry={loadTasks}
      />
    );
  }

  if (!tasks) {
    return (
      <LoadingScreen
        title="Loading trash"
        message="Fetching trashed tasks and cleaning expired entries."
      />
    );
  }

  return (
    <ScreenShell
      title="Trash"
      subtitle="Trashed tasks stay here for up to 30 days and cannot be restored."
      footer={<PrimaryButton label="Run cleanup" onPress={loadTasks} variant="secondary" />}>
      {tasks.length === 0 ? (
        <InfoCard>
          <ThemedText type="smallBold">Trash is empty</ThemedText>
          <ThemedText themeColor="textSecondary">
            Tasks moved to trash will appear here until they are permanently deleted or cleaned up.
          </ThemedText>
        </InfoCard>
      ) : (
        <TaskSection
          onTaskActionPress={handleDeleteTask}
          onTaskPress={() => undefined}
          section={{ title: 'Trashed Tasks', items: tasks }}
          taskActionLabel="Delete Forever"
        />
      )}
    </ScreenShell>
  );
}
