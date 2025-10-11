export interface ProductDto {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl?: string;
  quantity: number;
  price: number;
  state: boolean;
}

export interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  imageUrl?: string;
  quantity: number;
  price: number;
  state: boolean;
}
