import type { IBrandService } from "@/services/interfaces/IBrandService";
import type { Brand, BrandFormData } from "@/types/Brand";

export const BRANDS: Brand[] = [
  {
    id: "brand-acer",
    name: "Acer",
    logo: "/favicon/favicon-96x96.png",
    description: "Acer - equipos y accesos",
    productsCount: 12,
    state: true,
  },
  {
    id: "brand-dell",
    name: "Dell",
    logo: "/favicon/favicon-96x96.png",
    description: "Dell - computadoras y servidores",
    productsCount: 18,
    state: true,
  },
  {
    id: "brand-asus",
    name: "ASUS",
    logo: "/favicon/favicon-96x96.png",
    description: "ASUS - hardware y componentes",
    productsCount: 14,
    state: true,
  },
  {
    id: "brand-lenovo",
    name: "Lenovo",
    logo: "/favicon/favicon-96x96.png",
    description: "Lenovo - laptops y desktops",
    productsCount: 10,
    state: true,
  },
  {
    id: "brand-corsair",
    name: "Corsair",
    logo: "/favicon/favicon-96x96.png",
    description: "Corsair - periféricos y componentes",
    productsCount: 20,
    state: true,
  },
];

class BrandServiceMock implements IBrandService {
  getBrandById(
    _token: string,
    brandId: string
  ): Promise<{ success: boolean; brand?: Brand }> {
    const brand = BRANDS.find((b) => b.id === brandId);
    if (brand) {
      return Promise.resolve({ success: true, brand });
    } else {
      return Promise.resolve({ success: false });
    }
  }
  createBrand(
    _token: string,
    brand: BrandFormData
  ): Promise<{ success: boolean; message?: string; brand?: Brand }> {
    const newBrand: Brand = {
      id: `mock-id-${BRANDS.length + 1}`,
      name: brand.name,
      logo: brand.logo,
      description: brand.description,
      productsCount: brand.productsCount,
      state: brand.state,
    };
    BRANDS.push(newBrand);
    return Promise.resolve({ success: true, brand: newBrand });
  }
  updateBrandById(
    _token: string,
    brandId: string,
    brand: Partial<Brand>
  ): Promise<{ success: boolean; message?: string; brand?: Brand }> {
    const index = BRANDS.findIndex((b) => b.id === brandId);
    if (index !== -1) {
      BRANDS[index] = { ...BRANDS[index], ...brand };
      return Promise.resolve({ success: true, brand: BRANDS[index] });
    } else {
      return Promise.resolve({ success: false, message: "Brand not found" });
    }
  }
  deleteBrandById(
    _token: string,
    brandId: string
  ): Promise<{ success: boolean; message?: string }> {
    const index = BRANDS.findIndex((b) => b.id === brandId);
    if (index !== -1) {
      BRANDS.splice(index, 1);
      return Promise.resolve({ success: true });
    } else {
      return Promise.resolve({ success: false, message: "Brand not found" });
    }
  }
  async getAllBrands(_token: string) {
    const PRODUCTS = (await import("./productServiceMock")).PRODUCTS;

    // Calcular dinámicamente la cantidad de productos por marca para mantener consistencia
    const brandsWithCounts = BRANDS.map((b) => ({
      ...b,
      productsCount: PRODUCTS.filter((p) => p.brand?.id === b.id).length,
    }));
    return { success: true, brands: brandsWithCounts };
  }
}
export const brandServiceMock = new BrandServiceMock();
