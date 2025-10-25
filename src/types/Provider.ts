export interface ProviderFormData {
  code: string;
  name: string;
  email: string;
  address?: string;
  city?: string;
}

export interface Provider {
  id: string;
  code: string;
  name: string;
  email: string;
  address?: string;
  city?: string;
}
