import type { IProductService } from "@/services/interfaces/IProductService";
import type { ProductDto, ProductFormData } from "@/types/Product";
import { BRANDS } from "./brandServiceMock";
import { CATEGORIES } from "./categoryServiceMock";

export const PRODUCTS: ProductDto[] = [
  {
    id: "prod-01",
    name: "Acer Aspire 5 - i5",
    brand: BRANDS[0],
    categories: [CATEGORIES[0], CATEGORIES[4]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 12,
    price: 549.99,
    state: true,
  },
  {
    id: "prod-02",
    name: "Lenovo IdeaPad 3",
    brand: BRANDS[3],
    categories: [CATEGORIES[0]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 8,
    price: 479.99,
    state: true,
  },
  {
    id: "prod-03",
    name: "Dell Inspiron 15",
    brand: BRANDS[1],
    categories: [CATEGORIES[0], CATEGORIES[6]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 10,
    price: 599.99,
    state: true,
  },
  {
    id: "prod-04",
    name: "ASUS TUF Gaming - 16GB",
    brand: BRANDS[2],
    categories: [CATEGORIES[0], CATEGORIES[4]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 5,
    price: 899.99,
    state: true,
  },
  {
    id: "prod-05",
    name: "HP Pavilion Desktop",
    brand: BRANDS[1],
    categories: [CATEGORIES[1], CATEGORIES[4]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 6,
    price: 699.99,
    state: true,
  },
  {
    id: "prod-06",
    name: "Monitor LG 24'' 1080p",
    brand: BRANDS[2],
    categories: [CATEGORIES[2], CATEGORIES[3]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 20,
    price: 149.99,
    state: true,
  },
  {
    id: "prod-07",
    name: "Monitor Samsung Curvo 27''",
    brand: BRANDS[1],
    categories: [CATEGORIES[2]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 7,
    price: 279.99,
    state: true,
  },
  {
    id: "prod-08",
    name: "Mouse Logitech MX Master 3",
    brand: BRANDS[4],
    categories: [CATEGORIES[3]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 30,
    price: 99.99,
    state: true,
  },
  {
    id: "prod-09",
    name: "Teclado Mecánico Corsair K70",
    brand: BRANDS[4],
    categories: [CATEGORIES[3]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 15,
    price: 159.99,
    state: true,
  },
  {
    id: "prod-10",
    name: "SSD Samsung 1TB",
    brand: BRANDS[2],
    categories: [CATEGORIES[4]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 25,
    price: 119.99,
    state: true,
  },
  {
    id: "prod-11",
    name: "Fuente Corsair 650W",
    brand: BRANDS[4],
    categories: [CATEGORIES[4]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 9,
    price: 89.99,
    state: true,
  },
  {
    id: "prod-12",
    name: "Placa Madre ASUS Prime",
    brand: BRANDS[2],
    categories: [CATEGORIES[4]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 4,
    price: 199.99,
    state: true,
  },
  {
    id: "prod-13",
    name: "Memoria RAM 16GB DDR4",
    brand: BRANDS[4],
    categories: [CATEGORIES[4]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 40,
    price: 74.99,
    state: true,
  },
  {
    id: "prod-14",
    name: "Router TP-Link AC1200",
    brand: BRANDS[0],
    categories: [CATEGORIES[5]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 18,
    price: 49.99,
    state: true,
  },
  {
    id: "prod-15",
    name: "Switch 8 puertos Gigabit",
    brand: BRANDS[0],
    categories: [CATEGORIES[5]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 10,
    price: 69.99,
    state: true,
  },
  {
    id: "prod-16",
    name: "Office 365 - Licencia anual",
    brand: BRANDS[2],
    categories: [CATEGORIES[6]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 999,
    price: 99.0,
    state: true,
  },
  {
    id: "prod-17",
    name: "Antivirus Pro - Licencia 1 año",
    brand: BRANDS[2],
    categories: [CATEGORIES[6]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 999,
    price: 39.99,
    state: true,
  },
  {
    id: "prod-18",
    name: "Disco Duro 2TB HDD",
    brand: BRANDS[1],
    categories: [CATEGORIES[4]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 12,
    price: 79.99,
    state: true,
  },
  {
    id: "prod-19",
    name: "Cables HDMI 2m (pack 3)",
    brand: BRANDS[4],
    categories: [CATEGORIES[3]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 50,
    price: 14.99,
    state: true,
  },
  {
    id: "prod-20",
    name: "Webcam Logitech C270",
    brand: BRANDS[4],
    categories: [CATEGORIES[3]],
    imageUrl: "/favicon/favicon-96x96.png",
    quantity: 22,
    price: 39.99,
    state: true,
  },
];

class ProductServiceMock implements IProductService {
  async getAllProducts(
    _token: string
  ): Promise<{ success: boolean; products?: ProductDto[]; message?: string }> {
    return {
      success: true,
      products: PRODUCTS,
    };
  }
  async getProductById(
    _token: string,
    id: string
  ): Promise<{ success: boolean; product?: ProductDto }> {
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
  async createProduct(
    _token: string,
    product: ProductFormData
  ): Promise<{ success: boolean; product?: ProductDto }> {
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
  async deleteProductById(
    _token: string,
    id: string
  ): Promise<{ success: boolean; message?: string }> {
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
