import type { Provider } from "@/types/Provider";
import type { IProviderService } from "../interfaces/IProviderService";

const PROVIDERS: Provider[] = [
  {
    id: "mock-id-1",
    name: "Proveedor Mock 1",
  },
  {
    id: "mock-id-2",
    name: "Proveedor Mock 2",
  },
  {
    id: "mock-id-3",
    name: "Proveedor Mock 3",
  },
  {
    id: "mock-id-4",
    name: "Proveedor Mock 4",
  },
  {
    id: "mock-id-5",
    name: "Proveedor Mock 5",
  },
];

class ProviderServiceMock implements IProviderService {
  getAllProviders(
    _token: string
  ): Promise<{ success: boolean; providers?: Provider[] }> {
    return Promise.resolve({ success: true, providers: PROVIDERS });
  }

  getProviderById(
    _token: string,
    providerId: string
  ): Promise<{ success: boolean; provider?: Provider }> {
    const provider = PROVIDERS.find((c) => c.id === providerId);
    return Promise.resolve({ success: !!provider, provider });
  }
}
export const providerServiceMock = new ProviderServiceMock();
