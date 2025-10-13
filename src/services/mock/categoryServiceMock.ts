import type { Category } from "@/types/Category";
import type { ICategoryService } from "../interfaces/ICategoryService";

export const CATEGORIES: Category[] = [
  { id: "cat-laptops", name: "Laptops" },
  { id: "cat-desktops", name: "Desktops" },
  { id: "cat-monitores", name: "Monitores" },
  { id: "cat-accesorios", name: "Accesorios" },
  { id: "cat-componentes", name: "Componentes" },
  { id: "cat-redes", name: "Redes" },
  { id: "cat-software", name: "Software" },
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
