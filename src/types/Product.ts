import type { Brand } from "./Brand";
import { type Category } from "./Category";
export interface ProductDto {
  id: string;
  name: string;
  brand: Brand;
  categories: Category[];
  imageUrl?: string;
  stock: number;
  price: number;
}

export interface ProductFormData {
  name: string;
  brand: Brand;
  categories: Category[];
  imageUrl?: string;
  stock: number;
  price: number;
}
