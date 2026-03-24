import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { Menu } from 'react-native-paper';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { InfoCard } from '@/components/app/info-card';
import { LoadingScreen } from '@/components/app/loading-screen';
import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';
import { TaskSection } from '@/components/task/task-section';
import { ThemedText } from '@/components/themed-text';
import { useCompletionCelebration } from '@/modules/app/context/completion-celebration-context';
import { type HomeTaskSection } from '@/modules/task/domain/task-detail.types';
import { buildCompletionFeedback } from '@/modules/task/domain/recurrence';
import { type HomeViewType } from '@/modules/task/domain/task.types';
import { completeTask } from '@/modules/task/usecases/complete-task';
import { listHomeTasks } from '@/modules/task/usecases/list-home-tasks';

const HOME_VIEW_OPTIONS: HomeViewType[] = [
  'all',
  'today',
  'upcoming',
  'overdue',
  'by_category',
  'by_priority',
];

export default function HomeScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const { showCelebration } = useCompletionCelebration();
  const [sections, setSections] = useState<HomeTaskSection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [homeView, setHomeView] = useState<HomeViewType>('all');
  const [menuVisible, setMenuVisible] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      setSections(await listHomeTasks(database, homeView));
    } catch (homeError) {
      const message = homeError instanceof Error ? homeError.message : 'Failed to load tasks.';
      setError(message);
    }
  }, [database, homeView]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const handleCompleteTask = useCallback(
    async (taskId: string) => {
      try {
        const result = await completeTask(database, taskId);
        if (result.completed) {
          showCelebration(`${buildCompletionFeedback(result)} It is now in the Completed list.`);
        }
        await loadTasks();
      } catch (completionError) {
        const message =
          completionError instanceof Error ? completionError.message : 'Failed to complete task.';
        setError(message);
      }
    },
    [database, loadTasks, showCelebration]
  );

  if (error) {
    return (
      <ErrorStateScreen
        title="Unable to load tasks"
        message={error}
        retryLabel="Retry home"
        onRetry={loadTasks}
      />
    );
  }

  if (!sections) {
    return (
      <LoadingScreen
        title="Loading tasks"
        message="Fetching your active tasks from local storage."
      />
    );
  }

  return (
    <ScreenShell
      title="Home"
      subtitle="Your active task list lives here. Completed and trashed items stay out of the main list."
      footer={
        <>
          <Menu
            anchor={
              <PrimaryButton
                label={`View: ${formatHomeViewLabel(homeView)}`}
                onPress={() => setMenuVisible(true)}
                variant="secondary"
              />
            }
            onDismiss={() => setMenuVisible(false)}
            visible={menuVisible}>
            {HOME_VIEW_OPTIONS.map((option) => (
              <Menu.Item
                key={option}
                onPress={() => {
                  setHomeView(option);
                  setMenuVisible(false);
                }}
                title={formatHomeViewLabel(option)}
              />
            ))}
          </Menu>
          <PrimaryButton label="Create task" onPress={() => router.push('/task/create')} />
        </>
      }>
      {sections.length === 0 || sections.every((section) => section.items.length === 0) ? (
        <InfoCard>
          <ThemedText type="smallBold">No tasks yet</ThemedText>
          <ThemedText themeColor="textSecondary">
            Create your first task to see it appear on the home list.
          </ThemedText>
        </InfoCard>
      ) : (
        sections
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <TaskSection
              key={section.title}
              onTaskActionPress={handleCompleteTask}
              onTaskPress={(taskId) =>
                router.push({
                  pathname: '/task/[taskId]',
                  params: { taskId },
                })
              }
              section={section}
              taskActionLabel="Complete"
            />
        ))
      )}
    </ScreenShell>
  );
}

function formatHomeViewLabel(view: HomeViewType) {
  switch (view) {
    case 'today':
      return 'Today';
    case 'upcoming':
      return 'Upcoming';
    case 'overdue':
      return 'Overdue';
    case 'by_category':
      return 'By Category';
    case 'by_priority':
      return 'By Priority';
    case 'all':
    default:
      return 'All';
  }
}
