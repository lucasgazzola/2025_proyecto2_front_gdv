import { apiEndpoints } from "@/api/endpoints";
import type { IProviderService } from "./interfaces/IProviderService";
import type { Provider } from "@/types/Provider";

class ProviderServiceReal implements IProviderService {
  async getAllProviders(
    token: string
  ): Promise<{ success: boolean; providers?: Provider[]; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.providers.GET_ALL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        return { success: false, message: "Error al obtener los proveedores" };
      }
      const data = (await response.json()) as Provider[];
      return { success: true, providers: data };
    } catch (error) {
      return { success: false, message: "Error al obtener los proveedores" };
    }
  }
  async getProviderById(
    token: string,
    providerId: string
  ): Promise<{ success: boolean; provider?: Provider; message?: string }> {
    try {
      const response = await fetch(
        apiEndpoints.providers.GET_PROVIDER(providerId),
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        return { success: false, message: "Proveedor no encontrado" };
      }

      const data = (await response.json()) as Provider;

      return { success: response.ok, provider: data };
    } catch (error) {
      return { success: false, message: "Error al obtener el proveedor" };
    }
  }
}

export const providerServiceReal = new ProviderServiceReal();
