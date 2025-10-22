import type { Provider, ProviderFormData } from "@/types/Provider";
import type { IProviderService } from "../interfaces/IProviderService";

export const PROVIDERS: Provider[] = [
  { id: "1", code: "TS-001", name: "TechStore S.A.", productsCount: 12, address: "Av. Siempre Viva 123" },
  { id: "2", code: "SC-001", name: "SupplyCo", productsCount: 8, address: "Calle Falsa 456" },
  { id: "3", code: "CT-001", name: "Computech", productsCount: 20 },
  { id: "4", code: "CA-001", name: "Componentes AR", productsCount: 6 },
  { id: "5", code: "PM-001", name: "Periféricos y Más", productsCount: 14 },
  { id: "6", code: "SD-001", name: "SoftDistrib", productsCount: 5 },
  { id: "7", code: "NW-001", name: "NetWorks", productsCount: 9 },
  { id: "8", code: "LE-001", name: "Local Express", productsCount: 3 },
];

class ProviderServiceMock implements IProviderService {
  getAllProviders(_token: string): Promise<{ success: boolean; providers?: Provider[]; message?: string }> {
    if (PROVIDERS.length > 0) {
      return Promise.resolve({ success: true, providers: PROVIDERS });
    } else {
      return Promise.resolve({ success: false, message: "Proveedores no encontrados" });
    }
  } 
  getProviderById(
    _token: string,
    providerId: string
  ): Promise<{ success: boolean; provider?: Provider; message?: string }> {
    const provider = PROVIDERS.find((c) => c.id === providerId);
    if (provider) {
      return Promise.resolve({ success: true, provider });
    } else {
      return Promise.resolve({ success: false, message: "No encontrado" });
    }
  }

  async createProvider(
    _token: string,
    provider: ProviderFormData
  ): Promise<{ success: boolean; provider?: Provider; message?: string }> {
    // code must be provided and unique
    if (!provider.code || provider.code.trim() === "") {
      return Promise.resolve({ success: false, message: "El código es obligatorio" });
    }
    const exists = PROVIDERS.find((p) => p.code === provider.code);
    if (exists) {
      return Promise.resolve({ success: false, message: "El código ya existe" });
    }
    const id = provider.code;
    const newProvider: Provider = {
      id,
      code: provider.code,
      name: provider.name,
      productsCount: provider.productsCount ?? 0,
      address: provider.address,
    };
    PROVIDERS.push(newProvider);
    return Promise.resolve({ success: true, provider: newProvider });
  }

  async updateProviderById(
    _token: string,
    providerId: string,
    providerData: { name?: string; productsCount?: number }
  ): Promise<{ success: boolean; provider?: Provider; message?: string }> {
    const idx = PROVIDERS.findIndex((p) => p.id === providerId);
    if (idx === -1) return Promise.resolve({ success: false, message: "Proveedor no encontrado" });
    PROVIDERS[idx] = { ...PROVIDERS[idx], ...providerData };
    return Promise.resolve({ success: true, provider: PROVIDERS[idx] });
  }

  async deleteProviderById(
    _token: string,
    providerId: string
  ): Promise<{ success: boolean; message?: string }> {
    const idx = PROVIDERS.findIndex((p) => p.id === providerId);
    if (idx === -1) return Promise.resolve({ success: false, message: "Proveedor no encontrado" });
    PROVIDERS.splice(idx, 1);
    return Promise.resolve({ success: true });
  }
}

export const providerServiceMock = new ProviderServiceMock();
