import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Menu, Text, TextInput } from 'react-native-paper';

import { ErrorStateScreen } from '@/components/app/error-state-screen';
import { InfoCard } from '@/components/app/info-card';
import { LoadingScreen } from '@/components/app/loading-screen';
import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';
import { Spacing } from '@/constants/theme';
import { type Category } from '@/modules/category/domain/category.types';
import { SQLiteCategoryRepository } from '@/modules/category/repository/sqlite/sqlite-category.repository';
import { bulkReassignCategoryTasks } from '@/modules/category/usecases/bulk-reassign-category-tasks';
import { bulkUncategorizeCategoryTasks } from '@/modules/category/usecases/bulk-uncategorize-category-tasks';
import { deleteCategory } from '@/modules/category/usecases/delete-category';
import { listCategories } from '@/modules/category/usecases/list-categories';
import { createCategory, updateCategory } from '@/modules/category/usecases/save-category';

const CATEGORY_COLORS = ['#FF6B6B', '#F7B267', '#7BD389', '#6EC5FF', '#C792EA'];
const CATEGORY_ICONS = ['🏠', '💼', '🛒', '📚', '💪', '✨'];

type CategoryTaskCounts = Record<string, number>;

export default function CategoriesScreen() {
  const database = useSQLiteContext();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [taskCounts, setTaskCounts] = useState<CategoryTaskCounts>({});
  const [error, setError] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [moveMenuCategoryId, setMoveMenuCategoryId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);

  const currentEditingCategory = useMemo(
    () => categories?.find((category) => category.id === editingCategoryId) ?? null,
    [categories, editingCategoryId]
  );

  const loadCategoriesAndCounts = useCallback(async () => {
    try {
      setError(null);
      const categoryRepository = new SQLiteCategoryRepository(database);
      const nextCategories = await listCategories(database);
      const countsEntries = await Promise.all(
        nextCategories.map(async (category) => {
          const count = await categoryRepository.countTasksByCategory(category.id);
          return [category.id, count] as const;
        })
      );

      setCategories(nextCategories);
      setTaskCounts(Object.fromEntries(countsEntries));
    } catch (categoryError) {
      const message =
        categoryError instanceof Error ? categoryError.message : 'Failed to load categories.';
      setError(message);
    }
  }, [database]);

  useFocusEffect(
    useCallback(() => {
      loadCategoriesAndCounts();
    }, [loadCategoriesAndCounts])
  );

  const resetForm = useCallback(() => {
    setEditingCategoryId(null);
    setName('');
    setColor(CATEGORY_COLORS[0]);
    setIcon(CATEGORY_ICONS[0]);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setError(null);

      if (!name.trim()) {
        setError('Category name is required.');
        return;
      }

      if (currentEditingCategory) {
        await updateCategory(database, currentEditingCategory.id, {
          name,
          color,
          icon,
        });
      } else {
        await createCategory(database, {
          name,
          color,
          icon,
          sortOrder: (categories?.length ?? 0) + 1,
        });
      }

      resetForm();
      await loadCategoriesAndCounts();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save category.';
      setError(message);
    }
  }, [categories?.length, color, currentEditingCategory, database, icon, loadCategoriesAndCounts, name, resetForm]);

  const handleDelete = useCallback(
    async (categoryId: string) => {
      try {
        await deleteCategory(database, categoryId);
        if (editingCategoryId === categoryId) {
          resetForm();
        }
        await loadCategoriesAndCounts();
      } catch (deleteError) {
        const message =
          deleteError instanceof Error ? deleteError.message : 'Failed to delete category.';
        setError(message);
      }
    },
    [database, editingCategoryId, loadCategoriesAndCounts, resetForm]
  );

  const handleBulkUncategorize = useCallback(
    async (categoryId: string) => {
      try {
        await bulkUncategorizeCategoryTasks(database, categoryId);
        setMoveMenuCategoryId(null);
        await loadCategoriesAndCounts();
      } catch (uncategorizeError) {
        const message =
          uncategorizeError instanceof Error
            ? uncategorizeError.message
            : 'Failed to move category tasks to Uncategorized.';
        setError(message);
      }
    },
    [database, loadCategoriesAndCounts]
  );

  const handleBulkMove = useCallback(
    async (fromCategoryId: string, toCategoryId: string | null) => {
      try {
        await bulkReassignCategoryTasks(database, fromCategoryId, toCategoryId);
        setMoveMenuCategoryId(null);
        await loadCategoriesAndCounts();
      } catch (moveError) {
        const message =
          moveError instanceof Error ? moveError.message : 'Failed to update category in bulk.';
        setError(message);
      }
    },
    [database, loadCategoriesAndCounts]
  );

  if (error && !categories) {
    return (
      <ErrorStateScreen
        title="Unable to load categories"
        message={error}
        retryLabel="Retry categories"
        onRetry={loadCategoriesAndCounts}
      />
    );
  }

  if (!categories) {
    return (
      <LoadingScreen
        title="Loading categories"
        message="Fetching category list and related task counts."
      />
    );
  }

  return (
    <ScreenShell
      title="Categories"
      subtitle="Create, edit, and cleanly retire categories without leaving orphaned tasks.">
      {error ? (
        <InfoCard>
          <Text variant="bodyLarge">{error}</Text>
        </InfoCard>
      ) : null}

      <InfoCard>
        <Text variant="titleMedium">
          {currentEditingCategory ? 'Edit category' : 'Create category'}
        </Text>
        <TextInput label="Name" mode="outlined" value={name} onChangeText={setName} />
        <View style={styles.optionGroup}>
          <Text variant="labelLarge">Color</Text>
          <View style={styles.wrapRow}>
            {CATEGORY_COLORS.map((option) => (
              <Button
                key={option}
                mode={color === option ? 'contained' : 'outlined'}
                onPress={() => setColor(option)}
                style={[styles.choiceButton, { borderColor: option }]}>
                {option.replace('#', '')}
              </Button>
            ))}
          </View>
        </View>
        <View style={styles.optionGroup}>
          <Text variant="labelLarge">Icon</Text>
          <View style={styles.wrapRow}>
            {CATEGORY_ICONS.map((option) => (
              <Button
                key={option}
                mode={icon === option ? 'contained' : 'outlined'}
                onPress={() => setIcon(option)}
                style={styles.choiceButton}>
                {option}
              </Button>
            ))}
          </View>
        </View>
        <PrimaryButton label={currentEditingCategory ? 'Update category' : 'Save category'} onPress={handleSave} />
        {currentEditingCategory ? (
          <PrimaryButton label="Cancel edit" onPress={resetForm} variant="secondary" />
        ) : null}
      </InfoCard>

      {categories.length === 0 ? (
        <InfoCard>
          <Text variant="bodyLarge">No categories yet. Tasks will default to Uncategorized.</Text>
        </InfoCard>
      ) : (
        categories.map((category) => {
          const taskCount = taskCounts[category.id] ?? 0;
          return (
            <Card key={category.id} mode="contained" style={styles.categoryCard}>
              <Card.Content style={styles.categoryContent}>
                <Text variant="titleMedium">
                  {category.icon} {category.name}
                </Text>
                <Text variant="bodyMedium">Color: {category.color}</Text>
                <Text variant="bodyMedium">Tasks: {taskCount}</Text>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button
                  onPress={() => {
                    setEditingCategoryId(category.id);
                    setName(category.name);
                    setColor(category.color);
                    setIcon(category.icon);
                  }}>
                  Edit
                </Button>
                <Menu
                  anchor={
                    <Button onPress={() => setMoveMenuCategoryId(category.id)}>
                      Move Tasks
                    </Button>
                  }
                  onDismiss={() => setMoveMenuCategoryId(null)}
                  visible={moveMenuCategoryId === category.id}>
                  <Menu.Item
                    onPress={() => handleBulkUncategorize(category.id)}
                    title="To Uncategorized"
                  />
                  {categories
                    .filter((targetCategory) => targetCategory.id !== category.id)
                    .map((targetCategory) => (
                      <Menu.Item
                        key={targetCategory.id}
                        onPress={() => handleBulkMove(category.id, targetCategory.id)}
                        title={`To ${targetCategory.icon} ${targetCategory.name}`}
                      />
                    ))}
                </Menu>
                <Button disabled={taskCount > 0} onPress={() => handleDelete(category.id)}>
                  Delete
                </Button>
              </Card.Actions>
            </Card>
          );
        })
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  cardActions: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  categoryCard: {
    width: '100%',
  },
  categoryContent: {
    gap: Spacing.one,
  },
  choiceButton: {
    minWidth: 72,
  },
  optionGroup: {
    gap: Spacing.two,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
