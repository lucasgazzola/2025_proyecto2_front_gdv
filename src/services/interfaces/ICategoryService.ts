import type { Category } from "@/types/Category";

export interface ICategoryService {
  getAllCategories(
    token: string
  ): Promise<{ success: boolean; categories?: Category[]; message?: string }>;
  getCategoryById(
    token: string,
    categoryId: string
  ): Promise<{ success: boolean; category?: Category; message?: string }>;
}
