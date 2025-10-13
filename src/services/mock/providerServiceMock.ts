import type { Provider } from "@/types/Provider";
import type { IProviderService } from "../interfaces/IProviderService";

export const PROVIDERS: Provider[] = [
  { id: "prov-techstore", name: "TechStore S.A." },
  { id: "prov-supplyco", name: "SupplyCo" },
  { id: "prov-computech", name: "Computech" },
  { id: "prov-componentes", name: "Componentes AR" },
  { id: "prov-perifericos", name: "Periféricos y Más" },
  { id: "prov-software", name: "SoftDistrib" },
  { id: "prov-network", name: "NetWorks" },
  { id: "prov-local-express", name: "Local Express" },
];

class ProviderServiceMock implements IProviderService {
  getAllProviders(
    _token: string
  ): Promise<{ success: boolean; providers?: Provider[]; message?: string }> {
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
