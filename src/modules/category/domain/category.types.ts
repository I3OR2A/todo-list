export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
