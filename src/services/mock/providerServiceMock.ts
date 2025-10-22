import type { Provider, ProviderFormData } from "@/types/Provider";
import type { IProviderService } from "../interfaces/IProviderService";

export const PROVIDERS: Provider[] = [
  { id: "1", name: "TechStore S.A.", productsCount: 12 },
  { id: "2", name: "SupplyCo", productsCount: 8 },
  { id: "3", name: "Computech", productsCount: 20 },
  { id: "4", name: "Componentes AR", productsCount: 6 },
  { id: "5", name: "Periféricos y Más", productsCount: 14 },
  { id: "6", name: "SoftDistrib", productsCount: 5 },
  { id: "7", name: "NetWorks", productsCount: 9 },
  { id: "8", name: "Local Express", productsCount: 3 },
];

class ProviderServiceMock implements IProviderService {
  async getAllProviders(
    _token: string
  ): Promise<{ success: boolean; providers?: Provider[]; message?: string }> {
    return { 
      success: true, 
      providers: PROVIDERS 
    };
  }

  async getProviderById(
    _token: string,
    providerId: number
  ): Promise<{ success: boolean; provider?: Provider; message?: string }> {
    const provider = PROVIDERS.find((c) => c.id === providerId.toString());
    return Promise.resolve({ 
      success: !!provider, 
      provider, 
      message: provider ? undefined : "No encontrado" });
  }

  async createProvider(
    _token: string,
    provider: ProviderFormData
  ): Promise<{ success: boolean; provider?: Provider; message?: string }> {
    const id = `prov-${Date.now()}`;
    const newProvider: Provider = {
      id,
      name: provider.name,
      productsCount: provider.productsCount ?? 0,
    };
    PROVIDERS.push(newProvider);
    return Promise.resolve({ success: true, provider: newProvider });
  }

  async updateProvider(
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
