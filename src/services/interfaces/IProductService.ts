import type { ProductDto, ProductFormData } from "@/types/Product";

export interface IProductService {
  getAllProducts(
    token: string
  ): Promise<{ success: boolean; products?: ProductDto[]; message?: string }>;
  getProductById(
    token: string,
    id: string
  ): Promise<{ success: boolean; product?: ProductDto; message?: string }>;
  createProduct(
    token: string,
    product: ProductFormData
  ): Promise<{ success: boolean; product?: ProductDto; message?: string }>;
  updateProductById(
    token: string,
    productId: string,
    product: Partial<ProductDto>
  ): Promise<{ success: boolean; message?: string; product?: ProductDto }>;
  deleteProductById(
    token: string,
    id: string
  ): Promise<{ success: boolean; message?: string }>;
}
