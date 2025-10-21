export interface BrandFormData {
  logo: string;
  name: string;
  description: string;
  productsCount: number;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  productsCount: number;
  isActive: boolean;
}
