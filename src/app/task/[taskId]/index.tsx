import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { InfoCard } from '@/components/app/info-card';
import { LoadingScreen } from '@/components/app/loading-screen';
import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';
import { SubTaskList } from '@/components/task/subtask-list';
import { ThemedText } from '@/components/themed-text';
import { useCompletionCelebration } from '@/modules/app/context/completion-celebration-context';
import { buildCompletionFeedback, formatRecurrenceLabel } from '@/modules/task/domain/recurrence';
import { type TaskDetail } from '@/modules/task/domain/task-detail.types';
import { completeTask } from '@/modules/task/usecases/complete-task';
import { getTaskDetail } from '@/modules/task/usecases/get-task-detail';
import { moveTaskToTrash } from '@/modules/task/usecases/move-task-to-trash';
import { refreshTaskStatuses } from '@/modules/task/usecases/refresh-task-statuses';
import { toggleSubTask } from '@/modules/subtask/usecases/toggle-subtask';
import { formatTaskDateTime } from '@/shared/utils/datetime';

export default function TaskDetailsScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const database = useSQLiteContext();
  const router = useRouter();
  const { showCelebration } = useCompletionCelebration();
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    try {
      setError(null);
      await refreshTaskStatuses(database);
      setDetail(await getTaskDetail(database, taskId));
    } catch (detailError) {
      const message = detailError instanceof Error ? detailError.message : 'Failed to load task.';
      setError(message);
    }
  }, [database, taskId]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail])
  );

  async function handleTrash() {
    Alert.alert('Move task to trash?', 'The task will be removed from the home list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Move to trash',
        style: 'destructive',
        onPress: async () => {
          try {
            await moveTaskToTrash(database, taskId);
            router.replace('/(tabs)/home');
          } catch (moveError) {
            const message =
              moveError instanceof Error ? moveError.message : 'Failed to move task to trash.';
            setError(message);
          }
        },
      },
    ]);
  }

  async function handleComplete() {
    try {
      const result = await completeTask(database, taskId);
      if (result.completed) {
        showCelebration(`${buildCompletionFeedback(result)} It is now visible in Completed.`);
      }
      router.replace('/(tabs)/completed');
    } catch (completionError) {
      const message =
        completionError instanceof Error ? completionError.message : 'Failed to complete task.';
      setError(message);
    }
  }

  async function handleToggleSubTask(subTaskId: string, isCompleted: boolean) {
    try {
      const taskWasCompleted = detail?.task.status === 'completed';
      const completionResult = await toggleSubTask(database, taskId, subTaskId, isCompleted);
      await loadDetail();
      const refreshedDetail = await getTaskDetail(database, taskId);
      setDetail(refreshedDetail);
      if (!taskWasCompleted && refreshedDetail?.task.status === 'completed') {
        const feedback = completionResult?.completed
          ? buildCompletionFeedback(completionResult)
          : 'Task completed.';
        showCelebration(`All subtasks are done. ${feedback}`);
      }
    } catch (subTaskError) {
      const message =
        subTaskError instanceof Error ? subTaskError.message : 'Failed to update subtask.';
      setError(message);
    }
  }

  if (error) {
    return (
      <ErrorStateScreen
        title="Unable to load task"
        message={error}
        retryLabel="Retry details"
        onRetry={loadDetail}
      />
    );
  }

  if (!detail) {
    return (
      <LoadingScreen
        title="Loading task"
        message="Fetching task details, subtasks, and reminders from local storage."
      />
    );
  }

  return (
    <ScreenShell
      title="Task Details"
      subtitle="Review the saved task fields and jump into edit or trash actions."
      footer={
        <>
          {detail.task.status !== 'completed' && detail.task.status !== 'trashed' ? (
            <PrimaryButton label="Complete task" onPress={handleComplete} />
          ) : null}
          <PrimaryButton
            label="Edit task"
            onPress={() =>
              router.push({
                pathname: '/task/[taskId]/edit',
                params: { taskId },
              })
            }
          />
          {detail.task.status !== 'trashed' ? (
            <PrimaryButton label="Move to trash" variant="secondary" onPress={handleTrash} />
          ) : null}
        </>
      }>
      <InfoCard>
        <ThemedText type="smallBold">{detail.task.title}</ThemedText>
        {detail.category ? (
          <ThemedText themeColor="textSecondary">
            Category: {detail.category.icon} {detail.category.name}
          </ThemedText>
        ) : (
          <ThemedText themeColor="textSecondary">Category: Uncategorized</ThemedText>
        )}
        <ThemedText themeColor="textSecondary">Status: {detail.task.status.toUpperCase()}</ThemedText>
        <ThemedText themeColor="textSecondary">
          Due: {formatTaskDateTime(detail.task.dueAt)}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Priority: {detail.task.priority.toUpperCase()}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Recurrence: {formatRecurrenceLabel(detail.task.recurrenceType, detail.task.recurrenceInterval)}
        </ThemedText>
        {detail.task.isRecurring ? (
          <ThemedText themeColor="textSecondary">
            Completing this task creates the next recurring instance automatically.
          </ThemedText>
        ) : null}
        {detail.task.parentTaskId ? (
          <ThemedText themeColor="textSecondary">
            Generated from a previous recurring instance.
          </ThemedText>
        ) : null}
        {detail.task.note ? (
          <ThemedText themeColor="textSecondary">{detail.task.note}</ThemedText>
        ) : (
          <ThemedText themeColor="textSecondary">No note provided.</ThemedText>
        )}
      </InfoCard>

      <InfoCard>
        <ThemedText type="smallBold">Subtasks</ThemedText>
        <SubTaskList onToggle={handleToggleSubTask} subTasks={detail.subTasks} />
      </InfoCard>

      <InfoCard>
        <ThemedText type="smallBold">Reminders</ThemedText>
        {detail.reminders.filter((reminder) => reminder.reminderType === 'normal').length ===
        0 ? (
          <ThemedText themeColor="textSecondary">No reminders.</ThemedText>
        ) : (
          detail.reminders
            .filter((reminder) => reminder.reminderType === 'normal')
            .map((reminder) => (
            <ThemedText key={reminder.id} themeColor="textSecondary">
              • {formatTaskDateTime(reminder.remindAt)}
            </ThemedText>
            ))
        )}
      </InfoCard>
    </ScreenShell>
  );
}
