import React, { type PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

import { Spacing } from '@/constants/theme';

export function InfoCard({ children }: PropsWithChildren) {
  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content style={styles.content}>{children}</Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    width: '100%',
  },
  content: {
    gap: Spacing.two,
    minWidth: 0,
    padding: Spacing.three,
  },
});
