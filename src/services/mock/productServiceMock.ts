import type { IProductService } from "@/services/interfaces/IProductService";
import type { ProductDto, ProductFormData } from "@/types/Product";

class ProductServiceMock implements IProductService {
  async getAllProducts(_token: string) {
    return {
      success: true,
      products: [
        {
          id: "mock-id",
          name: "Producto Mock",
          brand: "Marca Mock",
          category: "Categoria Mock",
          imageUrl: "/favicon/favicon-96x96.png",
          quantity: 100,
          price: 10.99,
          state: true,
        },
        {
          id: "mock-id",
          name: "2 Mock",
          brand: "3 Mock",
          category: "Categoria Kcom",
          imageUrl: "/favicon/favicon-96x96.png",
          quantity: 2,
          price: 5.49,
          state: false,
        },
      ],
    };
  }
  async getProductById(_token: string, id: string) {
    return {
      success: true,
      product: {
        id,
        name: "Producto Mock",
        brand: "Marca Mock",
        category: "Categoria Mock",
        imageUrl: "/favicon/favicon-96x96.png",
        quantity: 100,
        state: true,
      },
    };
  }
  async addNewProduct(_token: string, product: ProductFormData) {
    return {
      success: true,
      product: {
        id: "mock-id",
        name: product.name,
        brand: product.brand,
        category: product.category,
        imageUrl: product.imageUrl,
        quantity: product.quantity,
        state: product.state,
      },
    };
  }
  async updateProduct(
    _token: string,
    _productId: string,
    _product: Partial<ProductDto>
  ) {
    return {
      success: true,
      message: "Producto actualizado (mock)",
    };
  }
  async deleteProduct(_token: string, _id: string) {
    return {
      success: true,
    };
  }
}
export const productServiceMock = new ProductServiceMock();
