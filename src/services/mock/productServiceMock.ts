import type { IProductService } from "@/services/interfaces/IProductService";
import type { ProductDto, ProductFormData } from "@/types/Product";
import { BRANDS } from "./brandServiceMock";
import { CATEGORIES } from "./categoryServiceMock";

const PRODUCTS: ProductDto[] = [
  {
    id: "mock-id-1",
    name: "Producto Mock",
    brand: BRANDS[0],
    categories: [CATEGORIES[0], CATEGORIES[1]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 100,
    price: 10.99,
    state: true,
  },
  {
    id: "mock-id-2",
    name: "2 Mock",
    brand: BRANDS[1],
    categories: [CATEGORIES[2]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 2,
    price: 5.49,
    state: false,
  },
  {
    id: "mock-id-3",
    name: "Producto Mock 3",
    brand: BRANDS[2],
    categories: [CATEGORIES[2]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 50,
    price: 15.99,
    state: true,
  },
  {
    id: "mock-id-4",
    name: "Producto Mock 4",
    brand: BRANDS[3],
    categories: [CATEGORIES[3]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 25,
    price: 8.49,
    state: false,
  },
  {
    id: "mock-id-5",
    name: "Producto Mock 5",
    brand: BRANDS[4],
    categories: [CATEGORIES[0], CATEGORIES[3]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 75,
    price: 12.99,
    state: true,
  },
];

class ProductServiceMock implements IProductService {
  async getAllProducts(_token: string) {
    return {
      success: true,
      products: PRODUCTS,
    };
  }
  async getProductById(_token: string, id: string) {
    const product = PRODUCTS.find((p) => p.id === id);
    if (product) {
      return Promise.resolve({ success: true, product });
    } else {
      return Promise.resolve({
        success: false,
        message: "Producto no encontrado (mock)",
      });
    }
  }
  async createProduct(_token: string, product: ProductFormData) {
    const newProduct: ProductDto = {
      id: `mock-id-${PRODUCTS.length + 1}`,
      name: product.name,
      brand: product.brand,
      categories: product.categories || [],
      imageUrl: product.imageUrl || "/favicon/favicon-96x96.png",
      quantity: product.quantity,
      price: product.price,
      state: product.state,
    };
    PRODUCTS.push(newProduct);
    return Promise.resolve({ success: true, product: newProduct });
  }
  async updateProductById(
    _token: string,
    productId: string,
    product: Partial<ProductDto>
  ): Promise<{ success: boolean; message?: string; product?: ProductDto }> {
    const index = PRODUCTS.findIndex((p) => p.id === productId);
    if (index !== -1) {
      PRODUCTS[index] = { ...PRODUCTS[index], ...product };
      return Promise.resolve({ success: true, product: PRODUCTS[index] });
    } else {
      return Promise.resolve({
        success: false,
        message: "Producto no encontrado (mock)",
      });
    }
  }
  async deleteProductById(_token: string, id: string) {
    const index = PRODUCTS.findIndex((p) => p.id === id);
    if (index !== -1) {
      PRODUCTS.splice(index, 1);
      return Promise.resolve({ success: true });
    } else {
      return Promise.resolve({
        success: false,
        message: "Producto no encontrado (mock)",
      });
    }
  }
}
export const productServiceMock = new ProductServiceMock();
