import { productServiceMock } from "@/services/mock/productServiceMock";
import { productServiceReal } from "@/services/productService";

const USE_MOCK_PRODUCT = import.meta.env.VITE_USE_MOCK_API === "true";
export const productService = USE_MOCK_PRODUCT
  ? productServiceMock
  : productServiceReal;
