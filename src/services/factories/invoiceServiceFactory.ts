import { invoiceServiceMock } from "@/services/mock/invoiceServiceMock";
import { invoiceServiceReal } from "@/services/invoiceService";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
export const invoiceService = USE_MOCK_API ? invoiceServiceMock : invoiceServiceReal;
