import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Menu, Text, TextInput } from 'react-native-paper';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { InfoCard } from '@/components/app/info-card';
import { LoadingScreen } from '@/components/app/loading-screen';
import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';
import { SearchResultCard } from '@/components/task/search-result-card';
import { Spacing } from '@/constants/theme';
import { useCompletionCelebration } from '@/modules/app/context/completion-celebration-context';
import { type Category } from '@/modules/category/domain/category.types';
import { listCategories } from '@/modules/category/usecases/list-categories';
import { buildCompletionFeedback } from '@/modules/task/domain/recurrence';
import { type TaskListItem, type TaskSearchQuery } from '@/modules/task/domain/task.types';
import { bulkCompleteTasks } from '@/modules/task/usecases/bulk-complete-tasks';
import { bulkMoveTasksToTrash } from '@/modules/task/usecases/bulk-move-tasks-to-trash';
import { bulkUpdateTaskCategory } from '@/modules/task/usecases/bulk-update-task-category';
import { completeTask } from '@/modules/task/usecases/complete-task';
import { moveTaskToTrash } from '@/modules/task/usecases/move-task-to-trash';
import { searchTasks } from '@/modules/task/usecases/search-tasks';
import { SQLiteSettingsRepository } from '@/modules/settings/repository/sqlite-settings.repository';
import {
  coerceSortBy,
  createInitialSearchState,
  hasActiveAdvancedFilters,
  parseSearchRouteState,
  serializeSearchRouteState,
  SORT_OPTIONS,
  type SearchFormState,
} from '@/modules/task/utils/search-route-state';
import { combineDateAndTime } from '@/shared/utils/datetime';

export default function SearchScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const { showCelebration } = useCompletionCelebration();
  const routeParams = useLocalSearchParams() as Record<string, string | string[] | undefined>;
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [results, setResults] = useState<TaskListItem[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [batchCategoryMenuVisible, setBatchCategoryMenuVisible] = useState(false);
  const [defaultSortBy, setDefaultSortBy] = useState<NonNullable<TaskSearchQuery['sortBy']>>('dueAt');
  const [keywordInput, setKeywordInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const routeParamsKey = useMemo(
    () => JSON.stringify({
      categoryIds: Array.isArray(routeParams.categoryIds)
        ? routeParams.categoryIds[0]
        : routeParams.categoryIds,
      dateFrom: Array.isArray(routeParams.dateFrom) ? routeParams.dateFrom[0] : routeParams.dateFrom,
      dateTo: Array.isArray(routeParams.dateTo) ? routeParams.dateTo[0] : routeParams.dateTo,
      hasReminder: Array.isArray(routeParams.hasReminder)
        ? routeParams.hasReminder[0]
        : routeParams.hasReminder,
      isRecurring: Array.isArray(routeParams.isRecurring)
        ? routeParams.isRecurring[0]
        : routeParams.isRecurring,
      keyword: Array.isArray(routeParams.keyword) ? routeParams.keyword[0] : routeParams.keyword,
      priority: Array.isArray(routeParams.priority) ? routeParams.priority[0] : routeParams.priority,
      sortBy: Array.isArray(routeParams.sortBy) ? routeParams.sortBy[0] : routeParams.sortBy,
      sortOrder: Array.isArray(routeParams.sortOrder)
        ? routeParams.sortOrder[0]
        : routeParams.sortOrder,
      statuses: Array.isArray(routeParams.statuses) ? routeParams.statuses[0] : routeParams.statuses,
    }),
    [routeParams]
  );
  const routeParamsSnapshot = useMemo(
    () => JSON.parse(routeParamsKey) as Record<string, string | undefined>,
    [routeParamsKey]
  );
  const state = useMemo(
    () => parseSearchRouteState(routeParamsSnapshot, defaultSortBy),
    [defaultSortBy, routeParamsSnapshot]
  );
  const stableState = useMemo(
    () => parseSearchRouteState(serializeSearchRouteState(state), defaultSortBy),
    [defaultSortBy, state]
  );

  const loadSearchBootstrap = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const [loadedCategories, settings] = await Promise.all([
        listCategories(database),
        new SQLiteSettingsRepository(database).getSettings(),
      ]);
      const nextDefaultSortBy = coerceSortBy(settings.defaultSort);

      setDefaultSortBy((currentSortBy) =>
        currentSortBy === nextDefaultSortBy ? currentSortBy : nextDefaultSortBy
      );
      setCategories(loadedCategories);
      setSelectedTaskIds([]);
    } catch (searchError) {
      const message = searchError instanceof Error ? searchError.message : 'Failed to load search.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [database]);

  const selectedCountLabel = useMemo(
    () => `${selectedTaskIds.length} selected`,
    [selectedTaskIds.length]
  );

  const filterSummary = useMemo(() => {
    const parts: string[] = [];

    if (state.statuses.length > 0) {
      parts.push(`status ${state.statuses.join(', ')}`);
    }

    if (state.priority.length > 0) {
      parts.push(`priority ${state.priority.join(', ')}`);
    }

    if (state.categoryIds.length > 0) {
      parts.push(`${state.categoryIds.length} categories`);
    }

    if (state.dateFrom || state.dateTo) {
      parts.push(`date range`);
    }

    if (state.hasReminder !== null) {
      parts.push(state.hasReminder ? 'with reminders' : 'without reminders');
    }

    if (state.isRecurring !== null) {
      parts.push(state.isRecurring ? 'recurring only' : 'non-recurring only');
    }

    return parts.length > 0 ? parts.join(' | ') : 'No advanced filters';
  }, [state]);

  const runSearch = useCallback(async (nextState: SearchFormState) => {
    try {
      setError(null);
      setIsLoading(true);
      setResults(await searchTasks(database, buildSearchQuery(nextState)));
      setSelectedTaskIds([]);
    } catch (searchError) {
      const message = searchError instanceof Error ? searchError.message : 'Failed to run search.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [database]);

  function applyRouteState(nextState: SearchFormState) {
    router.replace({
      pathname: '/(tabs)/search',
      params: serializeSearchRouteState(nextState),
    });
  }

  async function handleApplyKeyword() {
    const nextState = {
      ...state,
      keyword: keywordInput,
    };
    applyRouteState(nextState);
  }

  async function handleResultComplete(taskId: string) {
    try {
      setIsMutating(true);
      const result = await completeTask(database, taskId);
      if (result.completed) {
        showCelebration(`${buildCompletionFeedback(result)} Updated from search results.`);
      }
      await runSearch(state);
    } catch (taskError) {
      const message = taskError instanceof Error ? taskError.message : 'Failed to complete task.';
      setError(message);
    } finally {
      setIsMutating(false);
    }
  }

  async function handleResultTrash(taskId: string) {
    try {
      setIsMutating(true);
      await moveTaskToTrash(database, taskId);
      await runSearch(state);
    } catch (taskError) {
      const message = taskError instanceof Error ? taskError.message : 'Failed to trash task.';
      setError(message);
    } finally {
      setIsMutating(false);
    }
  }

  async function handleBulkComplete() {
    try {
      setIsMutating(true);
      await bulkCompleteTasks(database, selectedTaskIds);
      showCelebration(
        selectedTaskIds.length === 1
          ? '1 task completed.'
          : `${selectedTaskIds.length} tasks completed.`
      );
      await runSearch(state);
    } catch (taskError) {
      const message =
        taskError instanceof Error ? taskError.message : 'Failed to complete selected tasks.';
      setError(message);
    } finally {
      setIsMutating(false);
    }
  }

  async function handleBulkTrash() {
    try {
      setIsMutating(true);
      await bulkMoveTasksToTrash(database, selectedTaskIds);
      await runSearch(state);
    } catch (taskError) {
      const message =
        taskError instanceof Error ? taskError.message : 'Failed to trash selected tasks.';
      setError(message);
    } finally {
      setIsMutating(false);
    }
  }

  async function handleBulkCategoryUpdate(categoryId: string | null) {
    try {
      setIsMutating(true);
      setBatchCategoryMenuVisible(false);
      await bulkUpdateTaskCategory(database, selectedTaskIds, categoryId);
      await runSearch(state);
    } catch (taskError) {
      const message =
        taskError instanceof Error ? taskError.message : 'Failed to update selected task category.';
      setError(message);
    } finally {
      setIsMutating(false);
    }
  }

  function toggleSelection(taskId: string) {
    setSelectedTaskIds((currentState) =>
      currentState.includes(taskId)
        ? currentState.filter((id) => id !== taskId)
        : [...currentState, taskId]
    );
  }

  async function resetFilters() {
    const nextState = createInitialSearchState(state.sortBy);
    setKeywordInput('');
    applyRouteState(nextState);
  }

  useEffect(() => {
    loadSearchBootstrap();
  }, [loadSearchBootstrap]);

  useEffect(() => {
    if (!categories) {
      return;
    }

    setKeywordInput((currentKeyword) =>
      currentKeyword === stableState.keyword ? currentKeyword : stableState.keyword
    );
    runSearch(stableState);
  }, [categories, runSearch, stableState]);

  if (error && !categories) {
    return (
      <ErrorStateScreen
        title="Unable to load search"
        message={error}
        retryLabel="Retry search"
        onRetry={loadSearchBootstrap}
      />
    );
  }

  if (!categories) {
    return (
      <LoadingScreen
        title="Loading search"
        message="Preparing filters, categories, and the initial search result set."
      />
    );
  }

  return (
    <ScreenShell
      title="Search"
      subtitle="Search tasks by keyword, open filter and sort modals, and run batch actions.">
      {error ? (
        <InfoCard>
          <Text variant="bodyLarge">{error}</Text>
        </InfoCard>
      ) : null}

      <InfoCard>
        <Text variant="titleMedium">Query</Text>
        <TextInput
          label="Keyword"
          mode="outlined"
          placeholder="Search title, note, or category"
          value={keywordInput}
          onChangeText={setKeywordInput}
        />
        <PrimaryButton
          label={isLoading ? 'Searching...' : 'Apply search'}
          disabled={isLoading || isMutating}
          onPress={handleApplyKeyword}
        />
        <View style={styles.actionRow}>
          <PrimaryButton
            label={hasActiveAdvancedFilters(state) ? 'Edit filters' : 'Open filters'}
            onPress={() =>
              router.push({
                pathname: '/modal/filter',
                params: serializeSearchRouteState({
                  ...state,
                  keyword: keywordInput,
                }),
              })
            }
            variant="secondary"
          />
          <PrimaryButton
            label={`Sort: ${SORT_OPTIONS.find((option) => option.value === state.sortBy)?.label ?? 'Due time'}`}
            onPress={() =>
              router.push({
                pathname: '/modal/sort',
                params: serializeSearchRouteState({
                  ...state,
                  keyword: keywordInput,
                }),
              })
            }
            variant="secondary"
          />
        </View>
        <Text variant="bodyMedium">{filterSummary}</Text>
        <Text variant="bodyMedium">
          Sort order: {state.sortOrder.toUpperCase()} by{' '}
          {SORT_OPTIONS.find((option) => option.value === state.sortBy)?.label ?? 'Due time'}
        </Text>
        <Button onPress={resetFilters}>Reset filters</Button>
      </InfoCard>

      {selectedTaskIds.length > 0 ? (
        <InfoCard>
          <Text variant="titleMedium">Batch actions</Text>
          <Text variant="bodyLarge">{selectedCountLabel}</Text>
          <PrimaryButton
            label={isMutating ? 'Completing...' : 'Bulk complete'}
            disabled={isMutating}
            onPress={handleBulkComplete}
          />
          <PrimaryButton
            label={isMutating ? 'Moving...' : 'Bulk trash'}
            disabled={isMutating}
            onPress={handleBulkTrash}
            variant="secondary"
          />
          <Menu
            anchor={
              <PrimaryButton
                label="Bulk change category"
                onPress={() => setBatchCategoryMenuVisible(true)}
                variant="secondary"
              />
            }
            onDismiss={() => setBatchCategoryMenuVisible(false)}
            visible={batchCategoryMenuVisible}>
            <Menu.Item
              onPress={() => handleBulkCategoryUpdate(null)}
              title="Move to Uncategorized"
            />
            {categories.map((category) => (
              <Menu.Item
                key={category.id}
                onPress={() => handleBulkCategoryUpdate(category.id)}
                title={`Move to ${category.icon} ${category.name}`}
              />
            ))}
          </Menu>
          <Button onPress={() => setSelectedTaskIds([])}>Clear selection</Button>
        </InfoCard>
      ) : null}

      <InfoCard>
        <Text variant="titleMedium">Results</Text>
        <Text variant="bodyLarge">{results.length} tasks found</Text>
      </InfoCard>

      {isLoading ? (
        <InfoCard>
          <Text variant="bodyLarge">Running local keyword, filter, and sort queries.</Text>
        </InfoCard>
      ) : results.length === 0 ? (
        <InfoCard>
          <Text variant="bodyLarge">No tasks matched the current search filters.</Text>
        </InfoCard>
      ) : (
        results.map((item) => (
          <SearchResultCard
            key={item.id}
            isSelected={selectedTaskIds.includes(item.id)}
            item={item}
            onComplete={
              item.status === 'completed' || item.status === 'trashed'
                ? undefined
                : () => handleResultComplete(item.id)
            }
            onEdit={() =>
              router.push({
                pathname: '/task/[taskId]/edit',
                params: { taskId: item.id },
              })
            }
            onOpen={() =>
              router.push({
                pathname: '/task/[taskId]',
                params: { taskId: item.id },
              })
            }
            onSelect={() => toggleSelection(item.id)}
            onTrash={item.status === 'trashed' ? undefined : () => handleResultTrash(item.id)}
          />
        ))
      )}
    </ScreenShell>
  );
}

function buildSearchQuery(state: SearchFormState): TaskSearchQuery {
  return {
    categoryIds: state.categoryIds.length > 0 ? state.categoryIds : undefined,
    dateFrom: state.dateFrom ? combineDateAndTime(state.dateFrom, '00:00') ?? undefined : undefined,
    dateTo: state.dateTo ? combineDateAndTime(state.dateTo, '23:59') ?? undefined : undefined,
    hasReminder: state.hasReminder ?? undefined,
    isRecurring: state.isRecurring ?? undefined,
    keyword: state.keyword.trim() || undefined,
    priority: state.priority.length > 0 ? state.priority : undefined,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    statuses: state.statuses.length > 0 ? state.statuses : undefined,
  };
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
