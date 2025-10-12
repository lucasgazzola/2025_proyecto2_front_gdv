import type { IProductService } from "@/services/interfaces/IProductService";
import type { ProductDto, ProductFormData } from "@/types/Product";

const PRODUCTS: ProductDto[] = [
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
  async addNewProduct(_token: string, product: ProductFormData) {
    const newProduct: ProductDto = {
      id: `mock-id-${PRODUCTS.length + 1}`,
      name: product.name,
      brand: product.brand,
      category: product.category,
      imageUrl: product.imageUrl || "/favicon/favicon-96x96.png",
      quantity: product.quantity,
      price: product.price,
      state: product.state,
    };
    PRODUCTS.push(newProduct);
    return Promise.resolve({ success: true, product: newProduct });
  }
  async updateProduct(
    _token: string,
    _productId: string,
    _product: Partial<ProductDto>
  ) {
    const index = PRODUCTS.findIndex((p) => p.id === _productId);
    if (index !== -1) {
      PRODUCTS[index] = { ...PRODUCTS[index], ..._product };
      return Promise.resolve({ success: true, product: PRODUCTS[index] });
    } else {
      return Promise.resolve({
        success: false,
        message: "Producto no encontrado (mock)",
      });
    }
  }
  async deleteProduct(_token: string, _id: string) {
    const index = PRODUCTS.findIndex((p) => p.id === _id);
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
