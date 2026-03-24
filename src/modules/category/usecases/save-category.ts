import { type SQLiteDatabase } from 'expo-sqlite';

import {
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/modules/category/domain/category.types';
import { SQLiteCategoryRepository } from '@/modules/category/repository/sqlite/sqlite-category.repository';

export async function createCategory(database: SQLiteDatabase, input: CreateCategoryInput) {
  const categoryRepository = new SQLiteCategoryRepository(database);
  return categoryRepository.createCategory(input);
}

export async function updateCategory(
  database: SQLiteDatabase,
  categoryId: string,
  input: UpdateCategoryInput
) {
  const categoryRepository = new SQLiteCategoryRepository(database);
  return categoryRepository.updateCategory(categoryId, input);
}
