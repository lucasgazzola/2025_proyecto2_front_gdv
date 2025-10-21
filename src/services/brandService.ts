import { apiEndpoints } from "@/api/endpoints";
import type { IBrandService } from "./interfaces/IBrandService";
import type { Brand, BrandFormData } from "@/types/Brand";

class BrandServiceReal implements IBrandService {
  async getAllBrands(
    token: string
  ): Promise<{ success: boolean; brands?: Brand[]; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.brands.GET_ALL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        return { success: false, message: "Error al obtener las marcas" };
      }
      const data = (await response.json()) as Brand[];
      return { success: true, brands: data };
    } catch (error) {
      return { success: false, message: "Error al obtener las marcas" };
    }
  }

  async getBrandById(
    token: string,
    brandId: string
  ): Promise<{ success: boolean; brand?: Brand; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.brands.GET_BRAND(brandId), {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        return { success: false, message: "Marca no encontrada" };
      }

      const data = (await response.json()) as Brand;

      return { success: response.ok, brand: data };
    } catch (error) {
      return { success: false, message: "Error al obtener la marca" };
    }
  }

  async createBrand(
    token: string,
    brand: BrandFormData
  ): Promise<{ success: boolean; message?: string; brand?: Brand }> {
    try {
      const response = await fetch(apiEndpoints.brands.CREATE_BRAND, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(brand),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Error al crear la marca",
        };
      }

      const data = (await response.json()) as Brand;

      return { success: response.ok, brand: data };
    } catch (error) {
      return { success: false, message: "Error al crear la marca" };
    }
  }
  async updateBrandById(
    token: string,
    brandId: string,
    brand: Partial<Brand>
  ): Promise<{ success: boolean; message?: string; brand?: Brand }> {
    try {
      const response = await fetch(apiEndpoints.brands.UPDATE_BRAND(brandId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(brand),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Error al actualizar la marca",
        };
      }

      const data = (await response.json()) as Brand;

      return { success: response.ok, brand: data };
    } catch (error) {
      return { success: false, message: "Error al actualizar la marca" };
    }
  }

  async deleteBrandById(
    token: string,
    brandId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.brands.DELETE_BRAND(brandId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Error al eliminar la marca",
        };
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: "Error al eliminar la marca" };
    }
  }
}

export const brandServiceReal = new BrandServiceReal();
