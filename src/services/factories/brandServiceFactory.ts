import { brandServiceMock } from "@/services/mock/brandServiceMock";
import { brandServiceReal } from "@/services/brandService";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
export const brandService = USE_MOCK_API ? brandServiceMock : brandServiceReal;
