import type { Customer } from "./Customer";
import type { ProductDto } from "./Product";
import type { User } from "./User";

// Invoice.ts
export interface InvoiceDetail {
  id: string;
  product: ProductDto;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Factura completa
export interface Invoice {
  id: string;
  creator: User;
  customer?: Customer;
  // The backend may return invoiceDetails or items; accept both shapes
  invoiceDetails: InvoiceDetail[];
  // alias used by some parts of the UI
  items?: InvoiceDetail[];
  priceTotal: number;
  createdAt?: string;
}
