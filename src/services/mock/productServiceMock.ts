import type { IProductService } from "@/services/interfaces/IProductService";
import type { ProductDto, ProductFormData } from "@/types/Product";

class ProductServiceMock implements IProductService {
  async getAllProducts(_token: string) {
    return {
      success: true,
      products: [
        {
          id: "mock-id-1",
          name: "Producto Mock",
          brand: "Marca Mock",
          category: "Categoria Mock",
          imageUrl: "/favicon/favicon-96x96.png",
          quantity: 100,
          price: 10.99,
          state: true,
        },
        {
          id: "mock-id-2",
          name: "2 Mock",
          brand: "3 Mock",
          category: "Categoria Kcom",
          imageUrl: "/favicon/favicon-96x96.png",
          quantity: 2,
          price: 5.49,
          state: false,
        },
        {
          id: "mock-id-3",
          name: "Producto Mock 3",
          brand: "Marca Mock 3",
          category: "Categoria Mock 3",
          imageUrl: "/favicon/favicon-96x96.png",
          quantity: 50,
          price: 15.99,
          state: true,
        },
        {
          id: "mock-id-4",
          name: "Producto Mock 4",
          brand: "Marca Mock 4",
          category: "Categoria Mock 4",
          imageUrl: "/favicon/favicon-96x96.png",
          quantity: 25,
          price: 8.49,
          state: false,
        },
        {
          id: "mock-id-5",
          name: "Producto Mock 5",
          brand: "Marca Mock 5",
          category: "Categoria Mock 5",
          imageUrl: "/favicon/favicon-96x96.png",
          quantity: 75,
          price: 12.99,
          state: true,
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
        price: 10.99, // Added price to match ProductDto
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
        price: 0, // Default price added to match ProductDto
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
