import {
  type Category,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/modules/category/domain/category.types';

export interface CategoryRepository {
  createCategory(input: CreateCategoryInput): Promise<string>;
  updateCategory(categoryId: string, input: UpdateCategoryInput): Promise<void>;
  deleteCategory(categoryId: string): Promise<void>;
  getCategoryById(categoryId: string): Promise<Category | null>;
  listCategories(): Promise<Category[]>;
  countTasksByCategory(categoryId: string): Promise<number>;
}
