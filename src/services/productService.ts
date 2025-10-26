import { apiEndpoints } from "@/api/endpoints";
import type { ProductDto, ProductFormData } from "@/types/Product";
import type { IProductService } from "@/services/interfaces/IProductService";

class ProductServiceReal implements IProductService {
  async getAllProducts(
    token: string
  ): Promise<{ success: boolean; products?: ProductDto[]; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.products.GET_ALL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as any[];
      // Normalize server shape: imageURL -> imageUrl, ensure brand/category ids are strings
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const normalized: ProductDto[] = (data || []).map((p: any) => {
        const rawImage = p.imageUrl ?? p.imageURL ?? p.image ?? "";
        const imageUrl =
          rawImage && !rawImage.startsWith("http")
            ? `${API_BASE_URL}/${rawImage}`
            : rawImage;
        const brand = p.brand
          ? {
              ...p.brand,
              id: String((p.brand as any).id ?? ""),
              logo:
                p.brand.logo && !p.brand.logo.startsWith("http")
                  ? `${API_BASE_URL}/${p.brand.logo}`
                  : p.brand.logo,
            }
          : p.brand;

        return {
          ...p,
          id: String(p.id ?? ""),
          imageUrl,
          brand,
          categories: (p.categories || []).map((c: any) => ({
            ...c,
            id: String(c.id ?? ""),
          })),
        } as ProductDto;
      });

      return { success: true, products: normalized };
    } catch (error) {
      return { success: false };
    }
  }

  async getProductById(
    token: string,
    id: string
  ): Promise<{ success: boolean; product?: ProductDto; message?: string }> {
    try {
      const url = apiEndpoints.products.GET_PRODUCT(id);
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as any;
      if (!data) return { success: response.ok };
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const rawImage = data.imageUrl ?? data.imageURL ?? data.image ?? "";
      const imageUrl =
        rawImage && !rawImage.startsWith("http")
          ? `${API_BASE_URL}/${rawImage}`
          : rawImage;
      const brand = data.brand
        ? {
            ...data.brand,
            id: String((data.brand as any).id ?? ""),
            logo:
              data.brand.logo && !data.brand.logo.startsWith("http")
                ? `${API_BASE_URL}/${data.brand.logo}`
                : data.brand.logo,
          }
        : data.brand;

      const normalized: ProductDto = {
        ...data,
        id: String(data.id ?? ""),
        imageUrl,
        brand,
        categories: (data.categories || []).map((c: any) => ({
          ...c,
          id: String(c.id ?? ""),
        })),
      };
      return { success: response.ok, product: normalized };
    } catch (error) {
      return { success: false };
    }
  }

  async createProduct(
    token: string,
    product: ProductFormData
  ): Promise<{ success: boolean; product?: ProductDto; message?: string }> {
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
      const newProduct = (await response.json()) as any;
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const rawImage =
        newProduct.imageUrl ?? newProduct.imageURL ?? newProduct.image ?? "";
      const imageUrl =
        rawImage && !rawImage.startsWith("http")
          ? `${API_BASE_URL}/${rawImage}`
          : rawImage;
      const brand = newProduct.brand
        ? {
            ...newProduct.brand,
            id: String((newProduct.brand as any).id ?? ""),
            logo:
              newProduct.brand.logo && !newProduct.brand.logo.startsWith("http")
                ? `${API_BASE_URL}/${newProduct.brand.logo}`
                : newProduct.brand.logo,
          }
        : newProduct.brand;

      const normalized: ProductDto = {
        ...newProduct,
        id: String(newProduct.id ?? ""),
        imageUrl,
        brand,
        categories: (newProduct.categories || []).map((c: any) => ({
          ...c,
          id: String(c.id ?? ""),
        })),
      } as ProductDto;

      return { success: true, product: normalized };
    } catch (error) {
      return { success: false, message: "Error al crear el producto." };
    }
  }

  async updateProductById(
    token: string,
    productId: string,
    product: Partial<ProductDto>
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const url = apiEndpoints.products.UPDATE_PRODUCT(productId);
      const response = await fetch(url, {
        method: "PATCH",
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
  ): Promise<{ success: boolean; message?: string }> {
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
