import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useMemo, useState } from 'react';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { LoadingScreen } from '@/components/app/loading-screen';
import { ScreenShell } from '@/components/app/screen-shell';
import { TaskForm, type TaskFormState } from '@/components/task/task-form';
import { type Category } from '@/modules/category/domain/category.types';
import { listCategories } from '@/modules/category/usecases/list-categories';
import {
  buildDefaultReminderValue,
  parseDefaultReminderJson,
} from '@/modules/settings/domain/default-reminder';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';
import { type TaskFormErrors } from '@/modules/task/domain/task-detail.types';
import { createTask } from '@/modules/task/usecases/create-task';
import { validateTaskDraft } from '@/modules/task/usecases/task-validation';
import { combineDateAndTime, createDefaultDueAtParts } from '@/shared/utils/datetime';

export default function CreateTaskScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const defaultDueAtParts = useMemo(() => createDefaultDueAtParts(), []);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [state, setState] = useState<TaskFormState>({
    title: '',
    note: '',
    dueDate: defaultDueAtParts.dueDate,
    dueTime: defaultDueAtParts.dueTime,
    categoryId: null,
    priority: 'medium',
    recurrenceType: null,
    recurrenceInterval: '',
    subTaskTitles: [],
    reminderValues: [],
  });
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const [loadedCategories, settings] = await Promise.all([
          listCategories(database),
          new SQLiteSettingsRepository(database).getSettings(),
        ]);
        setCategories(loadedCategories);
        const dueAt = combineDateAndTime(defaultDueAtParts.dueDate, defaultDueAtParts.dueTime);
        const defaultReminder = dueAt
          ? buildDefaultReminderValue(dueAt, parseDefaultReminderJson(settings.defaultReminderJson))
          : null;
        if (defaultReminder) {
          setState((currentState) => ({
            ...currentState,
            reminderValues:
              currentState.reminderValues.length > 0
                ? currentState.reminderValues
                : [defaultReminder],
          }));
        }
      } catch (categoryError) {
        const message =
          categoryError instanceof Error ? categoryError.message : 'Failed to load categories.';
        setError(message);
      }
    }

    loadCategories();
  }, [database, defaultDueAtParts.dueDate, defaultDueAtParts.dueTime]);

  async function handleSubmit() {
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

      const taskId = await createTask(database, {
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
        submissionError instanceof Error ? submissionError.message : 'Failed to create task.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (error) {
    return (
      <ErrorStateScreen
        title="Unable to create task"
        message={error}
        retryLabel="Try again"
        onRetry={handleSubmit}
      />
    );
  }

  if (!categories) {
    return (
      <LoadingScreen
        title="Loading task form"
        message="Fetching categories and preparing the task form."
      />
    );
  }

  return (
    <ScreenShell
      title="Create Task"
      subtitle="Fill in the task details, then configure recurrence, subtasks, and reminders.">
      <TaskForm
        categories={categories}
        errors={errors}
        isSubmitting={isSubmitting}
        onChange={setState}
        onSubmit={handleSubmit}
        state={state}
        submitLabel="Save task"
      />
    </ScreenShell>
  );
}
