import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Chip, Menu, Text, TextInput } from 'react-native-paper';

import { InfoCard } from '@/components/app/info-card';
import { PrimaryButton } from '@/components/app/primary-button';
import { Spacing } from '@/constants/theme';
import { type Category } from '@/modules/category/domain/category.types';
import { formatRecurrenceLabel } from '@/modules/task/domain/recurrence';
import { type TaskFormErrors } from '@/modules/task/domain/task-detail.types';
import { type Priority, type RecurrenceType } from '@/modules/task/domain/task.types';

export type TaskFormState = {
  title: string;
  note: string;
  dueDate: string;
  dueTime: string;
  categoryId: string | null;
  priority: Priority;
  recurrenceType: RecurrenceType | null;
  recurrenceInterval: string;
  subTaskTitles: string[];
  reminderValues: string[];
};

type TaskFormProps = {
  categories: Category[];
  errors: TaskFormErrors;
  isSubmitting: boolean;
  onChange: (nextState: TaskFormState) => void;
  onSubmit: () => void;
  state: TaskFormState;
  submitLabel: string;
};

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const RECURRENCE_TYPES: { label: string; value: RecurrenceType | null }[] = [
  { label: 'None', value: null },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Every N Days', value: 'custom_days' },
  { label: 'Every N Weeks', value: 'custom_weeks' },
];

export function TaskForm({
  categories,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  state,
  submitLabel,
}: TaskFormProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 430;
  const [categoryMenuVisible, setCategoryMenuVisible] = React.useState(false);
  const [recurrenceMenuVisible, setRecurrenceMenuVisible] = React.useState(false);

  return (
    <View style={styles.form}>
      <InfoCard>
        <Text variant="titleMedium">Task basics</Text>
        <FormLabel label="Title" />
        <TextInput
          mode="outlined"
          placeholder="Buy groceries"
          style={styles.input}
          value={state.title}
          onChangeText={(title) => onChange({ ...state, title })}
        />
        {errors.title ? <FormError message={errors.title} /> : null}

        <FormLabel label="Category" />
        <Menu
          anchor={
            <PrimaryButton
              label={getCategoryLabel(categories, state.categoryId)}
              onPress={() => setCategoryMenuVisible(true)}
              variant="secondary"
            />
          }
          onDismiss={() => setCategoryMenuVisible(false)}
          visible={categoryMenuVisible}>
          <Menu.Item
            onPress={() => {
              onChange({ ...state, categoryId: null });
              setCategoryMenuVisible(false);
            }}
            title="Uncategorized"
          />
          {categories.map((category) => (
            <Menu.Item
              key={category.id}
              onPress={() => {
                onChange({ ...state, categoryId: category.id });
                setCategoryMenuVisible(false);
              }}
              title={`${category.icon} ${category.name}`}
            />
          ))}
        </Menu>

        <FormLabel label="Note" />
        <TextInput
          mode="outlined"
          multiline
          placeholder="Optional note"
          style={[styles.input, styles.multilineInput]}
          value={state.note}
          onChangeText={(note) => onChange({ ...state, note })}
        />

        <View style={[styles.row, isCompact && styles.rowCompact]}>
          <View style={styles.column}>
            <FormLabel label="Due date" />
            <TextInput
              autoCapitalize="none"
              mode="outlined"
              placeholder="2026-03-21"
              style={styles.input}
              value={state.dueDate}
              onChangeText={(dueDate) => onChange({ ...state, dueDate })}
            />
            {errors.dueDate ? <FormError message={errors.dueDate} /> : null}
          </View>

          <View style={styles.column}>
            <FormLabel label="Due time" />
            <TextInput
              autoCapitalize="none"
              mode="outlined"
              placeholder="18:30"
              style={styles.input}
              value={state.dueTime}
              onChangeText={(dueTime) => onChange({ ...state, dueTime })}
            />
            {errors.dueTime ? <FormError message={errors.dueTime} /> : null}
          </View>
        </View>

        <FormLabel label="Priority" />
        <View style={[styles.priorityGroup, isCompact && styles.priorityGroupCompact]}>
          {PRIORITIES.map((priority) => (
            <Chip
              key={priority}
              mode={state.priority === priority ? 'flat' : 'outlined'}
              onPress={() => onChange({ ...state, priority })}
              selected={state.priority === priority}
              style={[styles.priorityChip, isCompact && styles.priorityChipCompact]}>
              {priority.toUpperCase()}
            </Chip>
          ))}
        </View>
      </InfoCard>

      <InfoCard>
        <Text variant="titleMedium">Recurrence</Text>
        <Text variant="bodyMedium">
          Current rule: {formatRecurrenceLabel(state.recurrenceType, Number(state.recurrenceInterval) || null)}
        </Text>
        <Text variant="bodyMedium">
          Recurring tasks automatically create the next instance when completed.
        </Text>

        <Menu
          anchor={
            <PrimaryButton
              label={state.recurrenceType ? 'Change recurrence' : 'Choose recurrence'}
              onPress={() => setRecurrenceMenuVisible(true)}
              variant="secondary"
            />
          }
          onDismiss={() => setRecurrenceMenuVisible(false)}
          visible={recurrenceMenuVisible}>
          {RECURRENCE_TYPES.filter((item) => item.value !== null).map((recurrence) => (
            <Menu.Item
              key={recurrence.value}
              onPress={() => {
                onChange({
                  ...state,
                  recurrenceType: recurrence.value,
                  recurrenceInterval:
                    recurrence.value === 'custom_days' || recurrence.value === 'custom_weeks'
                      ? state.recurrenceInterval || '1'
                      : '',
                });
                setRecurrenceMenuVisible(false);
              }}
              title={recurrence.label}
            />
          ))}
        </Menu>

        <View style={[styles.choiceRow, isCompact && styles.choiceRowCompact]}>
          {state.recurrenceType ? (
            <Chip icon="calendar-refresh" mode="flat" selected>
              {formatRecurrenceLabel(
                state.recurrenceType,
                Number(state.recurrenceInterval) || null
              )}
            </Chip>
          ) : (
            <Chip mode="outlined">One-time task</Chip>
          )}
          {state.recurrenceType ? (
            <PrimaryButton
              fullWidth={false}
              label="Turn off recurrence"
              onPress={() =>
                onChange({
                  ...state,
                  recurrenceInterval: '',
                  recurrenceType: null,
                })
              }
              variant="secondary"
            />
          ) : null}
        </View>

        {state.recurrenceType === 'custom_days' || state.recurrenceType === 'custom_weeks' ? (
          <>
            <FormLabel label="Custom recurrence interval" />
            <TextInput
              keyboardType="number-pad"
              mode="outlined"
              placeholder="1"
              style={styles.input}
              value={state.recurrenceInterval}
              onChangeText={(recurrenceInterval) => onChange({ ...state, recurrenceInterval })}
            />
            <Text variant="bodySmall">
              {state.recurrenceType === 'custom_days'
                ? 'A new task will be created every N days.'
                : 'A new task will be created every N weeks.'}
            </Text>
            {errors.recurrenceInterval ? (
              <FormError message={errors.recurrenceInterval} />
            ) : null}
          </>
        ) : null}
      </InfoCard>

      <InfoCard>
        <Text variant="titleMedium">Subtasks</Text>
        {state.subTaskTitles.length === 0 ? (
          <Text variant="bodyMedium">No subtasks yet.</Text>
        ) : null}
        {state.subTaskTitles.map((subTaskTitle, index) => (
          <View key={`subtask-${index}`} style={[styles.inlineField, isCompact && styles.inlineFieldCompact]}>
            <TextInput
              mode="outlined"
              placeholder={`Subtask ${index + 1}`}
              style={[styles.input, styles.flexInput]}
              value={subTaskTitle}
              onChangeText={(value) =>
                onChange({
                  ...state,
                  subTaskTitles: state.subTaskTitles.map((item, itemIndex) =>
                    itemIndex === index ? value : item
                  ),
                })
              }
            />
            <Button
              compact
              mode="text"
              style={isCompact ? styles.inlineButtonCompact : undefined}
              onPress={() =>
                onChange({
                  ...state,
                  subTaskTitles: state.subTaskTitles.filter((_, itemIndex) => itemIndex !== index),
                })
              }>
              Remove
            </Button>
          </View>
        ))}
        <PrimaryButton
          label="Add subtask"
          variant="secondary"
          onPress={() => onChange({ ...state, subTaskTitles: [...state.subTaskTitles, ''] })}
        />
      </InfoCard>

      <InfoCard>
        <Text variant="titleMedium">Reminders</Text>
        <Text variant="bodyMedium">
          Use the format `YYYY-MM-DD HH:mm` for each reminder.
        </Text>
        {state.reminderValues.length === 0 ? (
          <Text variant="bodyMedium">No reminders yet.</Text>
        ) : null}
        {state.reminderValues.map((reminderValue, index) => (
          <View
            key={`reminder-${index}`}
            style={[styles.inlineField, isCompact && styles.inlineFieldCompact]}>
            <TextInput
              autoCapitalize="none"
              mode="outlined"
              placeholder="2026-03-21 18:00"
              style={[styles.input, styles.flexInput]}
              value={reminderValue}
              onChangeText={(value) =>
                onChange({
                  ...state,
                  reminderValues: state.reminderValues.map((item, itemIndex) =>
                    itemIndex === index ? value : item
                  ),
                })
              }
            />
            <Button
              compact
              mode="text"
              style={isCompact ? styles.inlineButtonCompact : undefined}
              onPress={() =>
                onChange({
                  ...state,
                  reminderValues: state.reminderValues.filter(
                    (_, itemIndex) => itemIndex !== index
                  ),
                })
              }>
              Remove
            </Button>
          </View>
        ))}
        {errors.reminders
          ? Object.entries(errors.reminders).map(([index, message]) => (
              <FormError key={index} message={`Reminder ${Number(index) + 1}: ${message}`} />
            ))
          : null}
        <PrimaryButton
          label="Add reminder"
          variant="secondary"
          onPress={() => onChange({ ...state, reminderValues: [...state.reminderValues, ''] })}
        />
      </InfoCard>

      {errors.form ? (
        <InfoCard>
          <FormError message={errors.form} />
        </InfoCard>
      ) : null}

      <PrimaryButton
        label={isSubmitting ? 'Saving...' : submitLabel}
        disabled={isSubmitting}
        onPress={onSubmit}
      />
    </View>
  );
}

function FormLabel({ label }: { label: string }) {
  return <Text variant="labelLarge">{label}</Text>;
}

function FormError({ message }: { message: string }) {
  return (
    <Text style={styles.errorText} variant="bodySmall">{message}</Text>
  );
}

function getCategoryLabel(categories: Category[], categoryId: string | null) {
  if (!categoryId) {
    return 'Uncategorized';
  }

  const category = categories.find((item) => item.id === categoryId);
  return category ? `${category.icon} ${category.name}` : 'Select category';
}

const styles = StyleSheet.create({
  choiceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  choiceRowCompact: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  column: {
    flex: 1,
    gap: Spacing.one,
    minWidth: 0,
  },
  errorText: {
    color: '#b42318',
    lineHeight: 20,
  },
  flexInput: {
    flex: 1,
    minWidth: 0,
  },
  form: {
    gap: Spacing.three,
    width: '100%',
  },
  inlineField: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    minWidth: 0,
    width: '100%',
  },
  inlineFieldCompact: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  inlineButtonCompact: {
    alignSelf: 'flex-start',
  },
  input: {
    minHeight: 56,
  },
  multilineInput: {
    minHeight: 112,
  },
  priorityChip: {
    flex: 1,
    minWidth: 0,
  },
  priorityChipCompact: {
    width: '100%',
  },
  priorityGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
    minWidth: 0,
    width: '100%',
  },
  priorityGroupCompact: {
    flexDirection: 'column',
  },
  wrapChip: {
    flexGrow: 0,
  },
  wrapGroup: {
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    minWidth: 0,
    width: '100%',
  },
  rowCompact: {
    flexDirection: 'column',
  },
});
