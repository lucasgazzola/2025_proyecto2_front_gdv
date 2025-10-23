import { customerServiceMock } from "@/services/mock/customerServiceMock";
import { customerServiceReal } from "@/services/customerService";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

export const customerService = USE_MOCK_API ? customerServiceMock : customerServiceReal;