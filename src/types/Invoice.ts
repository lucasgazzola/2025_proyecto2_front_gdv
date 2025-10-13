import type { ProductDto } from "./Product";
import type { Provider } from "./Provider";
import type { User } from "./User";

// Invoice.ts
export interface InvoiceDetail {
  id: string;
  product: ProductDto;
  provider: Provider;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Factura completa
export interface Invoice {
  id: string;
  creator: User;
  invoiceDetails: InvoiceDetail[];
  priceTotal: number;
  createdAt?: string;
}
