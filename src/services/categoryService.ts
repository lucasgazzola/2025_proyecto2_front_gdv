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
    } catch {
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
    } catch {
      return { success: false, message: "Error al obtener la categoría" };
    }
  }

  async createCategory(
    token: string,
    payload: { name: string; description?: string }
  ): Promise<{ success: boolean; category?: Category; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.categories.CREATE_CATEGORY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        try {
          const err = await response.json();
          const msg = err?.message || "Error al crear la categoría";
          return { success: false, message: msg };
        } catch {
          return { success: false, message: "Error al crear la categoría" };
        }
      }

      const data = (await response.json()) as Category;
      return { success: true, category: data };
    } catch {
      return { success: false, message: "Error al crear la categoría" };
    }
  }

  async deleteCategoryById(
    token: string,
    categoryId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.categories.DELETE_CATEGORY(categoryId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Error al eliminar la categoría",
        };
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: "Error al eliminar la categoría" };
    }
  }
  async updateCategoryById(token: string, categoryId: string, payload: Partial<Category>): Promise<{ success: boolean; category?: Category; message?: string; }> {
    try {
      const response = await fetch(apiEndpoints.categories.UPDATE_CATEGORY(categoryId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Error al actualizar la categoría",
        };
      }

      const data = (await response.json()) as Category;
      return { success: true, category: data };
    } catch (error) {
      return { success: false, message: "Error al actualizar la categoría" };
    }
  }
}

export const categoryServiceReal = new CategoryServiceReal();
