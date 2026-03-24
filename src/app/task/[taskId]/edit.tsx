import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useState } from 'react';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { LoadingScreen } from '@/components/app/loading-screen';
import { ScreenShell } from '@/components/app/screen-shell';
import { TaskForm, type TaskFormState } from '@/components/task/task-form';
import { type Category } from '@/modules/category/domain/category.types';
import { listCategories } from '@/modules/category/usecases/list-categories';
import { type TaskDetail, type TaskFormErrors } from '@/modules/task/domain/task-detail.types';
import { getTaskDetail } from '@/modules/task/usecases/get-task-detail';
import { validateTaskDraft } from '@/modules/task/usecases/task-validation';
import { updateTask } from '@/modules/task/usecases/update-task';
import { combineDateAndTime, formatTaskDateTime, splitIsoToDateTime } from '@/shared/utils/datetime';

export default function EditTaskScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const database = useSQLiteContext();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [state, setState] = useState<TaskFormState | null>(null);
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTask = useCallback(async () => {
    try {
      setError(null);
      const [nextDetail, nextCategories] = await Promise.all([
        getTaskDetail(database, taskId),
        listCategories(database),
      ]);

      if (!nextDetail) {
        setError('Task not found.');
        return;
      }

      const dueAtParts = splitIsoToDateTime(nextDetail.task.dueAt);

      setDetail(nextDetail);
      setCategories(nextCategories);
      setState({
        title: nextDetail.task.title,
        note: nextDetail.task.note ?? '',
        dueDate: dueAtParts?.date ?? '',
        dueTime: dueAtParts?.time ?? '',
        categoryId: nextDetail.task.categoryId ?? null,
        priority: nextDetail.task.priority,
        recurrenceType: nextDetail.task.recurrenceType ?? null,
        recurrenceInterval: nextDetail.task.recurrenceInterval
          ? String(nextDetail.task.recurrenceInterval)
          : '',
        subTaskTitles: nextDetail.subTasks.map((subTask) => subTask.title),
        reminderValues: nextDetail.reminders
          .filter((reminder) => reminder.reminderType === 'normal')
          .map((reminder) => formatTaskDateTime(reminder.remindAt)),
      });
    } catch (detailError) {
      const message = detailError instanceof Error ? detailError.message : 'Failed to load task.';
      setError(message);
    }
  }, [database, taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  async function handleSubmit() {
    if (!state) {
      return;
    }

    const validationErrors = validateTaskDraft(state);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const dueAt = combineDateAndTime(state.dueDate, state.dueTime);
    if (!dueAt) {
      setErrors({ form: 'Due date and time must be valid.' });
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      await updateTask(database, taskId, {
        title: state.title,
        note: state.note,
        dueAt,
        categoryId: state.categoryId,
        priority: state.priority,
        isRecurring: Boolean(state.recurrenceType),
        recurrenceType: state.recurrenceType,
        recurrenceInterval:
          state.recurrenceType === 'custom_days' || state.recurrenceType === 'custom_weeks'
            ? Number(state.recurrenceInterval)
            : null,
        recurrenceGenerateMode: state.recurrenceType ? 'after_completion' : null,
        subTaskTitles: state.subTaskTitles,
        reminders: state.reminderValues,
      });

      router.replace({
        pathname: '/task/[taskId]',
        params: { taskId },
      });
    } catch (submissionError) {
      const message =
        submissionError instanceof Error ? submissionError.message : 'Failed to update task.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (error) {
    return (
      <ErrorStateScreen
        title="Unable to edit task"
        message={error}
        retryLabel="Retry load"
        onRetry={loadTask}
      />
    );
  }

  if (!detail || !state || !categories) {
    return (
      <LoadingScreen
        title="Loading task"
        message="Fetching task details, subtasks, and reminders for editing."
      />
    );
  }

  return (
    <ScreenShell
      title="Edit Task"
      subtitle="Update the task, including recurrence, subtasks, and reminders.">
      <TaskForm
        categories={categories}
        errors={errors}
        isSubmitting={isSubmitting}
        onChange={setState}
        onSubmit={handleSubmit}
        state={state}
        submitLabel="Update task"
      />
    </ScreenShell>
  );
}
