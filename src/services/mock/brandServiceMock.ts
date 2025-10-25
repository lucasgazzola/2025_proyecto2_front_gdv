import type { IBrandService } from "@/services/interfaces/IBrandService";
import type { Brand, BrandFormData } from "@/types/Brand";

export const BRANDS: Brand[] = [
  {
    id: "brand-acer",
    name: "Acer",
    logo: "/favicon/favicon-96x96.png",
    description: "Acer - equipos y accesos",
    productsCount: 12,
    isActive: true,
  },
  {
    id: "brand-dell",
    name: "Dell",
    logo: "/favicon/favicon-96x96.png",
    description: "Dell - computadoras y servidores",
    productsCount: 18,
    isActive: true,
  },
  {
    id: "brand-asus",
    name: "ASUS",
    logo: "/favicon/favicon-96x96.png",
    description: "ASUS - hardware y componentes",
    productsCount: 14,
    isActive: true,
  },
  {
    id: "brand-lenovo",
    name: "Lenovo",
    logo: "/favicon/favicon-96x96.png",
    description: "Lenovo - laptops y desktops",
    productsCount: 10,
    isActive: true,
  },
  {
    id: "brand-corsair",
    name: "Corsair",
    logo: "/favicon/favicon-96x96.png",
    description: "Corsair - periféricos y componentes",
    productsCount: 20,
    isActive: true,
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
    brand: BrandFormData | FormData
  ): Promise<{ success: boolean; message?: string; brand?: Brand }> {
    let payload: any;
    if (brand instanceof FormData) {
      payload = {
        name: String(brand.get("name") || "Sin nombre"),
        logo: String(
          brand.get("logo") instanceof File
            ? (brand.get("logo") as File).name
            : brand.get("logo") || "/favicon/favicon-96x96.png"
        ),
        description: String(brand.get("description") || ""),
        productsCount: 0,
        isActive: String(brand.get("isActive")) === "true",
      };
    } else {
      payload = brand;
    }

    const newBrand: Brand = {
      id: `mock-id-${BRANDS.length + 1}`,
      name: payload.name,
      logo: payload.logo,
      description: payload.description,
      productsCount: payload.productsCount || 0,
      isActive: payload.isActive,
    };
    BRANDS.push(newBrand);
    return Promise.resolve({ success: true, brand: newBrand });
  }
  updateBrandById(
    _token: string,
    brandId: string,
    brand: Partial<Brand> | FormData
  ): Promise<{ success: boolean; message?: string; brand?: Brand }> {
    const index = BRANDS.findIndex((b) => b.id === brandId);
    if (index === -1) {
      return Promise.resolve({ success: false, message: "Brand not found" });
    }

    let updates: any;
    if (brand instanceof FormData) {
      updates = {
        name: brand.get("name") ? String(brand.get("name")) : undefined,
        description: brand.get("description")
          ? String(brand.get("description"))
          : undefined,
        logo:
          brand.get("logo") instanceof File
            ? (brand.get("logo") as File).name
            : brand.get("logo")
            ? String(brand.get("logo"))
            : undefined,
        state: brand.get("isActive")
          ? brand.get("isActive") === "true"
          : undefined,
      };
    } else {
      updates = brand;
    }

    BRANDS[index] = { ...BRANDS[index], ...updates };
    return Promise.resolve({ success: true, brand: BRANDS[index] });
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
