import { type SQLiteDatabase } from 'expo-sqlite';

import {
  type Category,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/modules/category/domain/category.types';
import { type CategoryRepository } from '@/modules/category/repository/category.repository';
import { createId } from '@/shared/utils/id';

type CategoryRow = {
  id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export class SQLiteCategoryRepository implements CategoryRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async createCategory(input: CreateCategoryInput): Promise<string> {
    const categoryId = createId('category');
    const now = new Date().toISOString();

    await this.database.runAsync(
      `
        INSERT INTO categories (id, name, color, icon, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      categoryId,
      input.name.trim(),
      input.color,
      input.icon,
      input.sortOrder,
      now,
      now
    );

    return categoryId;
  }

  async updateCategory(categoryId: string, input: UpdateCategoryInput): Promise<void> {
    const assignments: string[] = [];
    const values: (string | number)[] = [];

    if (input.name !== undefined) {
      assignments.push('name = ?');
      values.push(input.name.trim());
    }

    if (input.color !== undefined) {
      assignments.push('color = ?');
      values.push(input.color);
    }

    if (input.icon !== undefined) {
      assignments.push('icon = ?');
      values.push(input.icon);
    }

    if (input.sortOrder !== undefined) {
      assignments.push('sort_order = ?');
      values.push(input.sortOrder);
    }

    assignments.push('updated_at = ?');
    values.push(new Date().toISOString());

    await this.database.runAsync(
      `
        UPDATE categories
        SET ${assignments.join(', ')}
        WHERE id = ?
      `,
      ...values,
      categoryId
    );
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.database.runAsync(`DELETE FROM categories WHERE id = ?`, categoryId);
  }

  async getCategoryById(categoryId: string): Promise<Category | null> {
    const row = await this.database.getFirstAsync<CategoryRow>(
      `
        SELECT id, name, color, icon, sort_order, created_at, updated_at
        FROM categories
        WHERE id = ?
      `,
      categoryId
    );

    return row ? mapCategory(row) : null;
  }

  async listCategories(): Promise<Category[]> {
    const rows = await this.database.getAllAsync<CategoryRow>(
      `
        SELECT id, name, color, icon, sort_order, created_at, updated_at
        FROM categories
        ORDER BY sort_order ASC, name COLLATE NOCASE ASC
      `
    );

    return rows.map(mapCategory);
  }

  async countTasksByCategory(categoryId: string): Promise<number> {
    const row = await this.database.getFirstAsync<{ count: number }>(
      `
        SELECT COUNT(*) AS count
        FROM tasks
        WHERE category_id = ? AND status != 'trashed'
      `,
      categoryId
    );

    return row?.count ?? 0;
  }
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
