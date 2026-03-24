import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text, TextInput } from 'react-native-paper';

import { InfoCard } from '@/components/app/info-card';
import { LoadingScreen } from '@/components/app/loading-screen';
import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';
import { Spacing } from '@/constants/theme';
import { type Category } from '@/modules/category/domain/category.types';
import { listCategories } from '@/modules/category/usecases/list-categories';
import {
  parseSearchRouteState,
  PRIORITY_OPTIONS,
  serializeSearchRouteState,
  STATUS_OPTIONS,
  toggleArrayValue,
  UNCATEGORIZED_FILTER_ID,
} from '@/modules/task/utils/search-route-state';

export default function FilterModalScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const params = useLocalSearchParams() as Record<string, string | string[] | undefined>;
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState(() => parseSearchRouteState(params));

  const filterCount = useMemo(() => {
    let count = 0;

    if (state.statuses.length > 0) count += 1;
    if (state.priority.length > 0) count += 1;
    if (state.categoryIds.length > 0) count += 1;
    if (state.dateFrom || state.dateTo) count += 1;
    if (state.hasReminder !== null) count += 1;
    if (state.isRecurring !== null) count += 1;

    return count;
  }, [state]);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategories(await listCategories(database));
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Failed to load filters.';
        setError(message);
      }
    }

    loadCategories();
  }, [database]);

  function applyFilters() {
    router.replace({
      pathname: '/(tabs)/search',
      params: serializeSearchRouteState(state),
    });
  }

  function clearFilters() {
    setState((currentState) => ({
      ...currentState,
      categoryIds: [],
      dateFrom: '',
      dateTo: '',
      hasReminder: null,
      isRecurring: null,
      priority: [],
      statuses: [],
    }));
  }

  if (!categories) {
    return (
      <LoadingScreen
        title="Loading filters"
        message={error ?? 'Preparing category, status, and priority filters.'}
      />
    );
  }

  return (
    <ScreenShell
      title="Filter"
      subtitle="Adjust advanced search filters and send them back to the search page.">
      {error ? (
        <InfoCard>
          <Text variant="bodyLarge">{error}</Text>
        </InfoCard>
      ) : null}

      <InfoCard>
        <Text variant="titleMedium">Statuses</Text>
        <View style={styles.chipGroup}>
          {STATUS_OPTIONS.map((status) => (
            <Chip
              key={status}
              mode={state.statuses.includes(status) ? 'flat' : 'outlined'}
              onPress={() =>
                setState((currentState) => ({
                  ...currentState,
                  statuses: toggleArrayValue(currentState.statuses, status),
                }))
              }>
              {status}
            </Chip>
          ))}
        </View>
      </InfoCard>

      <InfoCard>
        <Text variant="titleMedium">Priority</Text>
        <View style={styles.chipGroup}>
          {PRIORITY_OPTIONS.map((priority) => (
            <Chip
              key={priority}
              mode={state.priority.includes(priority) ? 'flat' : 'outlined'}
              onPress={() =>
                setState((currentState) => ({
                  ...currentState,
                  priority: toggleArrayValue(currentState.priority, priority),
                }))
              }>
              {priority}
            </Chip>
          ))}
        </View>
      </InfoCard>

      <InfoCard>
        <Text variant="titleMedium">Category</Text>
        <View style={styles.chipGroup}>
          <Chip
            mode={state.categoryIds.includes(UNCATEGORIZED_FILTER_ID) ? 'flat' : 'outlined'}
            onPress={() =>
              setState((currentState) => ({
                ...currentState,
                categoryIds: toggleArrayValue(currentState.categoryIds, UNCATEGORIZED_FILTER_ID),
              }))
            }>
            Uncategorized
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.id}
              mode={state.categoryIds.includes(category.id) ? 'flat' : 'outlined'}
              onPress={() =>
                setState((currentState) => ({
                  ...currentState,
                  categoryIds: toggleArrayValue(currentState.categoryIds, category.id),
                }))
              }>
              {category.icon} {category.name}
            </Chip>
          ))}
        </View>
      </InfoCard>

      <InfoCard>
        <Text variant="titleMedium">Date range</Text>
        <View style={styles.inlineRow}>
          <TextInput
            autoCapitalize="none"
            label="Date from"
            mode="outlined"
            placeholder="2026-03-21"
            style={styles.flexField}
            value={state.dateFrom}
            onChangeText={(dateFrom) => setState((currentState) => ({ ...currentState, dateFrom }))}
          />
          <TextInput
            autoCapitalize="none"
            label="Date to"
            mode="outlined"
            placeholder="2026-03-21"
            style={styles.flexField}
            value={state.dateTo}
            onChangeText={(dateTo) => setState((currentState) => ({ ...currentState, dateTo }))}
          />
        </View>
      </InfoCard>

      <InfoCard>
        <Text variant="titleMedium">Extra filters</Text>
        <View style={styles.chipGroup}>
          <Chip
            mode={state.hasReminder === true ? 'flat' : 'outlined'}
            onPress={() =>
              setState((currentState) => ({
                ...currentState,
                hasReminder: currentState.hasReminder === true ? null : true,
              }))
            }>
            Has reminders
          </Chip>
          <Chip
            mode={state.hasReminder === false ? 'flat' : 'outlined'}
            onPress={() =>
              setState((currentState) => ({
                ...currentState,
                hasReminder: currentState.hasReminder === false ? null : false,
              }))
            }>
            No reminders
          </Chip>
          <Chip
            mode={state.isRecurring === true ? 'flat' : 'outlined'}
            onPress={() =>
              setState((currentState) => ({
                ...currentState,
                isRecurring: currentState.isRecurring === true ? null : true,
              }))
            }>
            Recurring only
          </Chip>
          <Chip
            mode={state.isRecurring === false ? 'flat' : 'outlined'}
            onPress={() =>
              setState((currentState) => ({
                ...currentState,
                isRecurring: currentState.isRecurring === false ? null : false,
              }))
            }>
            Non-recurring only
          </Chip>
        </View>
      </InfoCard>

      <InfoCard>
        <Text variant="bodyLarge">{filterCount} advanced filter groups active</Text>
      </InfoCard>

      <PrimaryButton label="Apply filters" onPress={applyFilters} />
      <PrimaryButton label="Clear filters" onPress={clearFilters} variant="secondary" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  flexField: {
    flex: 1,
    minWidth: 0,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
