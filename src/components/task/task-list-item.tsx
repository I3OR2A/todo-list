import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';

import { formatRecurrenceLabel } from '@/modules/task/domain/recurrence';
import { type TaskListItem } from '@/modules/task/domain/task.types';
import { formatTaskDateTime } from '@/shared/utils/datetime';

type TaskListItemCardProps = {
  actionLabel?: string;
  item: TaskListItem;
  onActionPress?: () => void;
  onPress: () => void;
};

export function TaskListItemCard({ actionLabel, item, onActionPress, onPress }: TaskListItemCardProps) {
  return (
    <Card mode="contained" onPress={onPress} style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium">{item.title}</Text>
        <View style={styles.chipRow}>
          <Chip compact mode="flat">{item.status.toUpperCase()}</Chip>
          {item.isRecurring ? (
            <Chip compact mode="outlined">{formatRecurrenceLabel(item.recurrenceType, item.recurrenceInterval)}</Chip>
          ) : null}
        </View>
        <Text variant="bodyMedium">Due: {formatTaskDateTime(item.dueAt)}</Text>
        <Text variant="bodyMedium">Priority: {item.priority.toUpperCase()}</Text>
        {item.note ? (
          <Text numberOfLines={2} variant="bodyMedium">{item.note}</Text>
        ) : null}
        <Text variant="bodyMedium">
          Subtasks left: {item.incompleteSubTaskCount ?? 0} | Reminders: {item.reminderCount ?? 0}
        </Text>
      </Card.Content>
      {actionLabel && onActionPress ? (
        <Card.Actions>
          <Button onPress={onActionPress}>{actionLabel}</Button>
        </Card.Actions>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    width: '100%',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  content: {
    gap: 8,
  },
});
