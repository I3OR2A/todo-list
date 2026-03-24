import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { TaskListItemCard } from '@/components/task/task-list-item';
import { Spacing } from '@/constants/theme';
import { type HomeTaskSection } from '@/modules/task/domain/task-detail.types';

type TaskSectionProps = {
  onTaskPress: (taskId: string) => void;
  section: HomeTaskSection;
  taskActionLabel?: string;
  onTaskActionPress?: (taskId: string) => void;
};

export function TaskSection({
  onTaskActionPress,
  onTaskPress,
  section,
  taskActionLabel,
}: TaskSectionProps) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium">{section.title}</Text>
      <View style={styles.items}>
        {section.items.map((task) => (
          <TaskListItemCard
            key={task.id}
            actionLabel={taskActionLabel}
            item={task}
            onActionPress={onTaskActionPress ? () => onTaskActionPress(task.id) : undefined}
            onPress={() => onTaskPress(task.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  items: {
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
});
