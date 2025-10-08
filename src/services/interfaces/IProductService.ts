import type { ProductDto, ProductFormData } from "@/types/Product";

export interface IProductService {
  getAllProducts(
    token: string
  ): Promise<{ success: boolean; products?: ProductDto[] }>;
  getProductById(
    token: string,
    id: string
  ): Promise<{ success: boolean; product?: ProductDto }>;
  addNewProduct(
    token: string,
    product: ProductFormData
  ): Promise<{ success: boolean; product?: ProductDto }>;
  updateProduct(
    token: string,
    productId: string,
    product: Partial<ProductDto>
  ): Promise<{ success: boolean; message?: string }>;
  deleteProduct(token: string, id: string): Promise<{ success: boolean }>;
}
