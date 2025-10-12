import { logServiceMock } from "@/services/mock/logServiceMock";
import { logServiceReal } from "@/services/logService";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
export const logsService = USE_MOCK_API ? logServiceMock : logServiceReal;
