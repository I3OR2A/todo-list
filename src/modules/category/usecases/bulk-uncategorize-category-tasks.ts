import { type SQLiteDatabase } from 'expo-sqlite';

import { bulkReassignCategoryTasks } from '@/modules/category/usecases/bulk-reassign-category-tasks';

export async function bulkUncategorizeCategoryTasks(
  database: SQLiteDatabase,
  categoryId: string
) {
  await bulkReassignCategoryTasks(database, categoryId, null);
}
