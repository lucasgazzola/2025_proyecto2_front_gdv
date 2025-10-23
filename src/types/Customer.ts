import type { Invoice } from "./Invoice";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  phone?: string;
  address?: string;
  city?: string;
  invoices: Invoice[];
  active: boolean;
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  phone?: string;
  address?: string;
  city?: string;
  invoices: Invoice[];
  active: boolean;
}
