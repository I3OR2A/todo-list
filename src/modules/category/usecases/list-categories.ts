import { type SQLiteDatabase } from 'expo-sqlite';

import { SQLiteCategoryRepository } from '@/modules/category/repository/sqlite/sqlite-category.repository';

export async function listCategories(database: SQLiteDatabase) {
  const categoryRepository = new SQLiteCategoryRepository(database);
  return categoryRepository.listCategories();
}
