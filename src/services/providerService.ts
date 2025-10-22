import { apiEndpoints } from "@/api/endpoints";
import type { IProviderService } from "./interfaces/IProviderService";
import type { Provider } from "@/types/Provider";

/**
 * Servicio real para providers (fetch a backend)
 * Implementa CRUD: list, get, create, update, delete
 */

class ProviderServiceReal implements IProviderService {
  async getAllProviders(
    token: string
  ): Promise<{ success: boolean; providers?: Provider[]; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.providers.GET_ALL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        return { success: false, message: "Error al obtener proveedores" };
      const data = (await response.json()) as Provider[];
      return { success: true, providers: data };
    } catch {
      return { success: false, message: "Error al obtener proveedores" };
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
      if (!response.ok)
        return { success: false, message: "Proveedor no encontrado" };
      const data = (await response.json()) as Provider;
      return { success: true, provider: data };
    } catch {
      return { success: false, message: "Error al obtener el proveedor" };
    }
  }

  async createProvider(
    token: string,
    providerData: { name: string; productsCount?: number }
  ): Promise<{ success: boolean; provider?: Provider; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.providers.CREATE_PROVIDER, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(providerData),
      });
      if (!response.ok) {
        const text = await response.text();
        return {
          success: false,
          message: text || "No se pudo crear proveedor",
        };
      }
      const data = (await response.json()) as Provider;
      return { success: true, provider: data };
    } catch {
      return { success: false, message: "Error al crear proveedor" };
    }
  }

  async updateProviderById(
    token: string,
    providerId: string,
    providerData: { name?: string; productsCount?: number }
  ): Promise<{ success: boolean; provider?: Provider; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.providers.UPDATE(providerId), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(providerData),
      });
      if (!response.ok)
        return { success: false, message: "No se pudo actualizar proveedor" };
      const data = (await response.json()) as Provider;
      return { success: true, provider: data };
    } catch {
      return { success: false, message: "Error al actualizar proveedor" };
    }
  }

  async deleteProviderById(
    token: string,
    providerId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.providers.DELETE(providerId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        return { success: false, message: "No se pudo eliminar proveedor" };
      return { success: true };
    } catch {
      return { success: false, message: "Error al eliminar proveedor" };
    }
  }
}

export const providerServiceReal = new ProviderServiceReal();
