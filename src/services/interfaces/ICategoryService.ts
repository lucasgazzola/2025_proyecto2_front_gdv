import type { Category } from "@/types/Category";

export interface ICategoryService {
  getAllCategories(
    token: string
  ): Promise<{ success: boolean; categories?: Category[]; message?: string }>;
  getCategoryById(
    token: string,
    categoryId: string
  ): Promise<{ success: boolean; category?: Category; message?: string }>;
  createCategory(
    token: string,
    payload: { name: string; description?: string }
  ): Promise<{ success: boolean; category?: Category; message?: string }>;
  deleteCategoryById(
    token: string,
    categoryId: string
  ): Promise<{ success: boolean; message?: string }>;
  updateCategoryById(
    token: string,
    categoryId: string,
    payload: Partial<Category>
  ): Promise<{ success: boolean; category?: Category; message?: string }>;
}
