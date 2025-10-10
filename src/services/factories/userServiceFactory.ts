import { userServiceMock } from "@/services/mock/userServiceMock";
import { userServiceReal } from "@/services/userService";

const USE_MOCK_USER = import.meta.env.VITE_USE_MOCK_API === "true";

export const userService = USE_MOCK_USER ? userServiceMock : userServiceReal;
