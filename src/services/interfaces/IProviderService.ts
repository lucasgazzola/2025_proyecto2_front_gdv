import type { Provider } from "@/types/Provider";

export interface IProviderService {
  getAllProviders(
    token: string
  ): Promise<{ success: boolean; providers?: Provider[]; message?: string }>;
  getProviderById(
    token: string,
    providerId: string
  ): Promise<{ success: boolean; provider?: Provider; message?: string }>;
}
