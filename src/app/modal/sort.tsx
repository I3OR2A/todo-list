import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';

import { InfoCard } from '@/components/app/info-card';
import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';
import { Spacing } from '@/constants/theme';
import {
  parseSearchRouteState,
  serializeSearchRouteState,
  SORT_OPTIONS,
} from '@/modules/task/utils/search-route-state';

export default function SortModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams() as Record<string, string | string[] | undefined>;
  const [state, setState] = useState(() => parseSearchRouteState(params));

  function applySort() {
    router.replace({
      pathname: '/(tabs)/search',
      params: serializeSearchRouteState(state),
    });
  }

  return (
    <ScreenShell
      title="Sort"
      subtitle="Choose the current result ordering and send it back to the search page.">
      <InfoCard>
        <Text variant="titleMedium">Sort by</Text>
        <View style={styles.chipGroup}>
          {SORT_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              mode={state.sortBy === option.value ? 'flat' : 'outlined'}
              onPress={() =>
                setState((currentState) => ({
                  ...currentState,
                  sortBy: option.value,
                }))
              }>
              {option.label}
            </Chip>
          ))}
        </View>
      </InfoCard>

      <InfoCard>
        <Text variant="titleMedium">Sort order</Text>
        <View style={styles.chipGroup}>
          <Chip
            mode={state.sortOrder === 'asc' ? 'flat' : 'outlined'}
            onPress={() =>
              setState((currentState) => ({
                ...currentState,
                sortOrder: 'asc',
              }))
            }>
            Ascending
          </Chip>
          <Chip
            mode={state.sortOrder === 'desc' ? 'flat' : 'outlined'}
            onPress={() =>
              setState((currentState) => ({
                ...currentState,
                sortOrder: 'desc',
              }))
            }>
            Descending
          </Chip>
        </View>
      </InfoCard>

      <PrimaryButton label="Apply sort" onPress={applySort} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
});
