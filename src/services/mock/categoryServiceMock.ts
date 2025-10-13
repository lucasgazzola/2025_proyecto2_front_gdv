import type { Category } from "@/types/Category";
import type { ICategoryService } from "../interfaces/ICategoryService";

export const CATEGORIES: Category[] = [
  { id: "cat-1", name: "Categoria 1" },
  { id: "cat-2", name: "Categoria 2" },
  { id: "cat-3", name: "Categoria 3" },
  { id: "cat-4", name: "Categoria 4" },
  { id: "cat-5", name: "Categoria 5" },
];

class CategoryServiceMock implements ICategoryService {
  getAllCategories(
    _token: string
  ): Promise<{ success: boolean; categories?: Category[] }> {
    return Promise.resolve({ success: true, categories: CATEGORIES });
  }

  getCategoryById(
    _token: string,
    categoryId: string
  ): Promise<{ success: boolean; category?: Category }> {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    return Promise.resolve({ success: !!category, category });
  }
}
export const categoryServiceMock = new CategoryServiceMock();
