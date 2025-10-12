import { apiEndpoints } from "@/api/endpoints";
import type { ICategoryService } from "./interfaces/ICategoryService";
import type { Category } from "@/types/Category";

class CategoryServiceReal implements ICategoryService {
  async getAllCategories(
    token: string
  ): Promise<{ success: boolean; categories?: Category[]; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.categories.GET_ALL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        return { success: false, message: "Error al obtener las categorías" };
      }
      const data = (await response.json()) as Category[];
      return { success: true, categories: data };
    } catch (error) {
      return { success: false, message: "Error al obtener las categorías" };
    }
  }
  async getCategoryById(
    token: string,
    categoryId: string
  ): Promise<{ success: boolean; category?: Category; message?: string }> {
    try {
      const response = await fetch(
        apiEndpoints.categories.GET_CATEGORY(categoryId),
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        return { success: false, message: "Categoría no encontrada" };
      }

      const data = (await response.json()) as Category;

      return { success: response.ok, category: data };
    } catch (error) {
      return { success: false, message: "Error al obtener la categoría" };
    }
  }
}

export const categoryServiceReal = new CategoryServiceReal();
