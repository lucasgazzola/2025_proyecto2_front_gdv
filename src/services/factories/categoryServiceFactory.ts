import { categoryServiceMock } from "@/services/mock/categoryServiceMock";
import { categoryServiceReal } from "@/services/categoryService";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";
export const categoryService = USE_MOCK_API
  ? categoryServiceMock
  : categoryServiceReal;
