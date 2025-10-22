export interface ProviderFormData{
  code: string;
  name: string;
  productsCount?: number;
  address?: string;
}

export interface Provider {
  id: string;
  code: string;
  name: string;
  productsCount: number;
  address?: string;
}
