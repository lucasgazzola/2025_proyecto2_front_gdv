import type { Brand, BrandFormData } from "@/types/Brand";

export interface IBrandService {
  getAllBrands(
    token: string
  ): Promise<{ success: boolean; brands?: Brand[]; message?: string }>;
  getBrandById(
    token: string,
    brandId: string
  ): Promise<{ success: boolean; brand?: Brand; message?: string }>;
  createBrand(
    token: string,
    brand: BrandFormData | FormData
  ): Promise<{ success: boolean; message?: string; brand?: Brand }>;
  updateBrandById(
    token: string,
    brandId: string,
    brand: Partial<Brand> | FormData
  ): Promise<{ success: boolean; message?: string; brand?: Brand }>;
  deleteBrandById(
    token: string,
    brandId: string
  ): Promise<{ success: boolean; message?: string }>;
}
