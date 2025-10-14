import { tokenServiceMock } from "@/services/mock/tokenServiceMock";
import { tokenServiceReal } from "@/services/tokenService";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
export const tokenService = USE_MOCK_API ? tokenServiceMock : tokenServiceReal;
