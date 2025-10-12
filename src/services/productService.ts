import { apiEndpoints } from "@/api/endpoints";
import type { ProductDto, ProductFormData } from "@/types/Product";
import type { IProductService } from "@/services/interfaces/IProductService";

class ProductServiceReal implements IProductService {
  async getAllProducts(
    token: string
  ): Promise<{ success: boolean; products?: ProductDto[] }> {
    try {
      const response = await fetch(apiEndpoints.products.GET_ALL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as ProductDto[];
      return { success: true, products: data };
    } catch (error) {
      return { success: false };
    }
  }

  async getProductById(
    token: string,
    id: string
  ): Promise<{ success: boolean; product?: ProductDto }> {
    try {
      const url = apiEndpoints.products.GET_PRODUCT(id);
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as ProductDto;
      return { success: response.ok, product: data };
    } catch (error) {
      return { success: false };
    }
  }

  async createProduct(
    token: string,
    product: ProductFormData
  ): Promise<{ success: boolean; product?: ProductDto }> {
    try {
      const response = await fetch(apiEndpoints.products.ADD_PRODUCT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error("Failed to create product");
      const productId = (await response.text()) as ProductDto["id"];
      return {
        success: true,
        product: {
          id: productId,
          name: (product as ProductFormData).name,
          brand: (product as ProductFormData).brand,
          category: (product as ProductFormData).category,
          imageUrl: (product as ProductFormData).imageUrl,
          quantity: (product as ProductFormData).quantity,
          price: (product as ProductFormData).price,
          state: (product as ProductFormData).state,
        } as ProductDto,
      };
    } catch (error) {
      return { success: false };
    }
  }

  async updateProductById(
    token: string,
    productId: string,
    product: Partial<ProductDto>
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const url = apiEndpoints.products.UPDATE_PRODUCT;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...product, id: productId }),
      });
      return { success: response.ok };
    } catch (error) {
      return {
        success: false,
        message: "Error al actualizar el producto. Intenta nuevamente.",
      };
    }
  }

  async deleteProductById(
    token: string,
    id: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await fetch(apiEndpoints.products.DELETE_PRODUCT(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: response.ok };
    } catch (error) {
      return { success: false };
    }
  }
}

export const productServiceReal = new ProductServiceReal();
