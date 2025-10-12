import type { ProductDto, ProductFormData } from "@/types/Product";

export interface IProductService {
  getAllProducts(
    token: string
  ): Promise<{ success: boolean; products?: ProductDto[]; message?: string }>;
  getProductById(
    token: string,
    id: string
  ): Promise<{ success: boolean; product?: ProductDto; message?: string }>;
  addNewProduct(
    token: string,
    product: ProductFormData
  ): Promise<{ success: boolean; product?: ProductDto; message?: string }>;
  updateProduct(
    token: string,
    productId: string,
    product: Partial<ProductDto>
  ): Promise<{ success: boolean; message?: string; product?: ProductDto }>;
  deleteProduct(
    token: string,
    id: string
  ): Promise<{ success: boolean; message?: string }>;
}
