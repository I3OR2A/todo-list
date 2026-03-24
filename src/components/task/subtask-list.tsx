import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';

import { Spacing } from '@/constants/theme';
import { type TaskSubItem } from '@/modules/subtask/domain/subtask.types';

type SubTaskListProps = {
  onToggle?: (subTaskId: string, isCompleted: boolean) => void;
  subTasks: TaskSubItem[];
};

export function SubTaskList({ onToggle, subTasks }: SubTaskListProps) {
  if (subTasks.length === 0) {
    return <Text variant="bodyMedium">No subtasks.</Text>;
  }

  return (
    <View style={styles.list}>
      {subTasks.map((subTask) => (
        <View key={subTask.id} style={styles.row}>
          <Checkbox
            disabled={!onToggle}
            onPress={() => onToggle?.(subTask.id, !subTask.isCompleted)}
            status={subTask.isCompleted ? 'checked' : 'unchecked'}
          />
          <Text
            style={subTask.isCompleted ? styles.completedText : undefined}
            variant="bodyMedium">
            {subTask.title}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  completedText: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  list: {
    gap: Spacing.one,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.one,
  },
});
