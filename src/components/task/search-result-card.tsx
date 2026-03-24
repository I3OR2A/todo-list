import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Checkbox, Chip, Text } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';

import { Spacing } from '@/constants/theme';
import { formatRecurrenceLabel } from '@/modules/task/domain/recurrence';
import { type TaskListItem } from '@/modules/task/domain/task.types';
import { formatTaskDateTime } from '@/shared/utils/datetime';

type SearchResultCardProps = {
  isSelected: boolean;
  item: TaskListItem;
  onComplete?: () => void;
  onEdit: () => void;
  onOpen: () => void;
  onSelect: () => void;
  onTrash?: () => void;
};

export function SearchResultCard({
  isSelected,
  item,
  onComplete,
  onEdit,
  onOpen,
  onSelect,
  onTrash,
}: SearchResultCardProps) {
  const card = (
    <Card mode="contained" onPress={onOpen} style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <Checkbox onPress={onSelect} status={isSelected ? 'checked' : 'unchecked'} />
          <View style={styles.meta}>
            <Text variant="titleMedium">{item.title}</Text>
            <View style={styles.chipRow}>
              <Chip compact mode="flat">{item.status.toUpperCase()}</Chip>
              {item.isRecurring ? (
                <Chip compact mode="outlined">
                  {formatRecurrenceLabel(item.recurrenceType, item.recurrenceInterval)}
                </Chip>
              ) : null}
            </View>
            <Text variant="bodyMedium">Status: {item.status}</Text>
            <Text variant="bodyMedium">Due: {formatTaskDateTime(item.dueAt)}</Text>
            <Text variant="bodyMedium">
              Category: {item.categoryName ?? 'Uncategorized'}
            </Text>
            <Text variant="bodyMedium">Priority: {item.priority.toUpperCase()}</Text>
            <Text variant="bodyMedium">
              Reminders: {item.reminderCount ?? 0} | Subtasks left: {item.incompleteSubTaskCount ?? 0}
            </Text>
            {item.note ? <Text variant="bodyMedium">{item.note}</Text> : null}
          </View>
        </View>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        {onComplete ? <Button onPress={onComplete}>Complete</Button> : null}
        <Button onPress={onEdit}>Edit</Button>
        {onTrash ? <Button onPress={onTrash}>Trash</Button> : null}
      </Card.Actions>
    </Card>
  );

  if (!onTrash) {
    return card;
  }

  return (
    <Swipeable renderRightActions={() => <SwipeDeleteAction onPress={onTrash} />}>
      {card}
    </Swipeable>
  );
}

function SwipeDeleteAction({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.swipeAction}>
      <Button buttonColor="#b42318" mode="contained" onPress={onPress} textColor="#ffffff">
        Trash
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  card: {
    width: '100%',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  content: {
    gap: Spacing.one,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.one,
  },
  meta: {
    flex: 1,
    gap: Spacing.one,
    minWidth: 0,
  },
  swipeAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: Spacing.two,
    width: 120,
  },
});
