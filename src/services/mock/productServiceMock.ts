import type { IProductService } from "@/services/interfaces/IProductService";
import type { ProductDto, ProductFormData } from "@/types/Product";

class ProductServiceMock implements IProductService {
  async getAllProducts(token: string) {
    return {
      success: true,
      products: [
        {
          id: "mock-id",
          idEcommerce: "mock-ecommerce-id",
          name: "Producto Mock",
          quantity: 100,
        },
      ],
    };
  }
  async getProductById(token: string, id: string) {
    return {
      success: true,
      product: {
        id,
        idEcommerce: "mock-ecommerce-id",
        name: "Producto Mock",
        quantity: 100,
      },
    };
  }
  async addNewProduct(token: string, product: ProductFormData) {
    return {
      success: true,
      product: {
        id: "mock-id",
        idEcommerce: product.idEcommerce,
        name: product.name,
        quantity: product.quantity,
      },
    };
  }
  async updateProduct(
    token: string,
    productId: string,
    product: Partial<ProductDto>
  ) {
    return {
      success: true,
      message: "Producto actualizado (mock)",
    };
  }
  async deleteProduct(token: string, id: string) {
    return {
      success: true,
    };
  }
}
export const productServiceMock = new ProductServiceMock();
