import { type SQLiteDatabase } from 'expo-sqlite';

import { SQLiteCategoryRepository } from '@/modules/category/repository/sqlite/sqlite-category.repository';

export async function deleteCategory(database: SQLiteDatabase, categoryId: string) {
  const categoryRepository = new SQLiteCategoryRepository(database);
  const taskCount = await categoryRepository.countTasksByCategory(categoryId);

  if (taskCount > 0) {
    throw new Error(
      'This category still has tasks. Move them or change them to Uncategorized before deleting.'
    );
  }

  await categoryRepository.deleteCategory(categoryId);
}
