import type { Category } from "@/types/Category";
import type { ICategoryService } from "../interfaces/ICategoryService";

const CATEGORIES: Category[] = [
  {
    id: "mock-id-1",
    name: "Categoría Mock 1",
  },
  {
    id: "mock-id-2",
    name: "Categoría Mock 2",
  },
  {
    id: "mock-id-3",
    name: "Categoría Mock 3",
  },
  {
    id: "mock-id-4",
    name: "Categoría Mock 4",
  },
  {
    id: "mock-id-5",
    name: "Categoría Mock 5",
  },
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
