export interface BrandFormData {
  logo: string;
  name: string;
  description: string;
  productsCount: number;
  state: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  productsCount: number;
  state: boolean;
}
