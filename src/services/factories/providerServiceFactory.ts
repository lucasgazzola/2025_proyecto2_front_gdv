import { providerServiceMock } from "@/services/mock/providerServiceMock";
import { providerServiceReal } from "@/services/providerService";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
export const providerService = USE_MOCK_API
  ? providerServiceMock
  : providerServiceReal;
