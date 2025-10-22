import type { Provider } from "@/types/Provider";

/**
 * Interfaz del servicio de proveedores
 */
export interface IProviderService {
  getAllProviders(
    token: string
  ): Promise<{ success: boolean; providers?: Provider[]; message?: string }>;
  getProviderById(
    token: string,
    providerId: string
  ): Promise<{ success: boolean; provider?: Provider; message?: string }>;
  createProvider(
    token: string,
    providerData: { name: string; productsCount?: number }
  ): Promise<{ success: boolean; provider?: Provider; message?: string }>;
  updateProviderById(
    token: string,
    providerId: string,
    providerData: { name?: string; productsCount?: number }
  ): Promise<{ success: boolean; provider?: Provider; message?: string }>;
  deleteProviderById(
    token: string,
    providerId: string
  ): Promise<{ success: boolean; message?: string }>;
}
