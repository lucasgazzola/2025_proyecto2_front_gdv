import { authServiceMock } from "@/services/mock/authServiceMock";
import { authServiceReal } from "@/services/authService";

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_API === "true";
export const authService = USE_MOCK_AUTH ? authServiceMock : authServiceReal;
