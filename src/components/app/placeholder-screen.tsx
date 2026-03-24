import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Divider, List, Text } from 'react-native-paper';

import { InfoCard } from '@/components/app/info-card';
import { ScreenShell } from '@/components/app/screen-shell';
import { Spacing } from '@/constants/theme';

type PlaceholderScreenProps = {
  title: string;
  description: string;
  milestoneNote: string;
  highlights?: string[];
  statusLabel?: string;
  children?: ReactNode;
};

export function PlaceholderScreen({
  children,
  description,
  highlights = [],
  milestoneNote,
  statusLabel = 'Planned Surface',
  title,
}: PlaceholderScreenProps) {
  return (
    <ScreenShell title={title} subtitle={description}>
      <InfoCard>
        <View style={styles.heroRow}>
          <Text variant="titleMedium">Placeholder Route</Text>
          <Chip compact>{statusLabel}</Chip>
        </View>
        <Text style={styles.copy} variant="bodyLarge">
          {milestoneNote}
        </Text>
        {highlights.length > 0 ? (
          <>
            <Divider />
            <View style={styles.list}>
              {highlights.map((highlight, index) => (
                <List.Item
                  key={`${title}-highlight-${index}`}
                  descriptionNumberOfLines={3}
                  left={(props) => <List.Icon {...props} icon="circle-small" />}
                  style={styles.listItem}
                  title={highlight}
                  titleNumberOfLines={3}
                />
              ))}
            </View>
          </>
        ) : null}
      </InfoCard>
      {children ? <View style={styles.extra}>{children}</View> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  copy: {
    lineHeight: 22,
  },
  extra: {
    gap: Spacing.three,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    gap: Spacing.one,
  },
  listItem: {
    paddingHorizontal: 0,
  },
});
