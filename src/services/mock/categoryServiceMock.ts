import type { Category } from "@/types/Category";
import type { ICategoryService } from "../interfaces/ICategoryService";

export const CATEGORIES: Category[] = [
  { id: "1", name: "Laptops", description: "Portable computers" },
  { id: "2", name: "Desktops", description: "Personal desktop computers" },
  { id: "3", name: "Monitores", description: "Display monitors" },
  { id: "4", name: "Accesorios", description: "Computer accessories" },
  { id: "5", name: "Componentes", description: "Computer components" },
  { id: "6", name: "Redes", description: "Networking equipment" },
  { id: "7", name: "Software", description: "Software applications" },
];

class CategoryServiceMock implements ICategoryService {
  getAllCategories(
    _token: string
  ): Promise<{ success: boolean; categories?: Category[] }> {
    // Return a shallow copy so callers don't keep a reference to the internal array.
    return Promise.resolve({ success: true, categories: [...CATEGORIES] });
  }

  getCategoryById(
    _token: string,
    categoryId: string
  ): Promise<{ success: boolean; category?: Category }> {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    // Return a shallow copy of the object to avoid external mutation of internal state
    return Promise.resolve({ success: !!category, category: category ? { ...category } : undefined });
  }

  createCategory(
    _token: string,
    payload: { name: string; description?: string }
  ): Promise<{ success: boolean; category?: Category; message?: string }> {
    const exists = CATEGORIES.some((c) => c.name.toLowerCase() === payload.name.toLowerCase());
    if (exists) {
      return Promise.resolve({ success: false, message: "La categoría ya existe" });
    }
    const newCat: Category = { id: String(Date.now()), name: payload.name, description: payload.description };
    CATEGORIES.unshift(newCat);
    return Promise.resolve({ success: true, category: newCat });
  }

  deleteCategoryById(
    _token: string,
    categoryId: string
  ): Promise<{ success: boolean; message?: string }> {
    const index = CATEGORIES.findIndex((c) => c.id === categoryId);
    if (index !== -1) {
      CATEGORIES.splice(index, 1);
      return Promise.resolve({ success: true });
    } else {
      return Promise.resolve({ success: false, message: "Category not found" });
    }
  }
}
export const categoryServiceMock = new CategoryServiceMock();
