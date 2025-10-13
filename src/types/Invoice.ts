// Invoice.ts
export interface Added {
  id: string;
  name: string;
  provider: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// En este caso, una línea de factura es exactamente igual a un "Added"
export type InvoiceLine = Added;

// Factura completa
export interface Invoice {
  id?: string;
  lines: InvoiceLine[];
  priceTotal: number;
  createdAt?: string;
}


