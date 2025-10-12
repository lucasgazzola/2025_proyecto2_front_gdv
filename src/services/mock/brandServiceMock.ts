import type { IBrandService } from "@/services/interfaces/IBrandService";
import type { Brand, BrandFormData } from "@/types/Brand";

const BRANDS: Brand[] = [
  {
    id: "mock-id-1",
    name: "Marca Mock 1",
    logo: "/favicon/favicon-96x96.png",
    description: "Descripción de la Marca Mock 1",
    productsCount: 10,
    state: true,
  },
  {
    id: "mock-id-2",
    name: "Marca Mock 2",
    logo: "/favicon/favicon-96x96.png",
    description: "Descripción de la Marca Mock 2",
    productsCount: 5,
    state: false,
  },
  {
    id: "mock-id-3",
    name: "Marca Mock 3",
    logo: "/favicon/favicon-96x96.png",
    description: "Descripción de la Marca Mock 3",
    productsCount: 8,
    state: true,
  },
  {
    id: "mock-id-4",
    name: "Marca Mock 4",
    logo: "/favicon/favicon-96x96.png",
    description: "Descripción de la Marca Mock 4",
    productsCount: 12,
    state: false,
  },
  {
    id: "mock-id-5",
    name: "Marca Mock 5",
    logo: "/favicon/favicon-96x96.png",
    description: "Descripción de la Marca Mock 5",
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
    return { success: true, brands: BRANDS };
  }
}
export const brandServiceMock = new BrandServiceMock();
