import type { Invoice } from "@/types/Invoice";

export interface IInvoiceService {
  getAllInvoices(
    token: string
  ): Promise<{ success: boolean; invoices?: Invoice[]; message?: string }>;

  getInvoiceById(
    token: string,
    id: string
  ): Promise<{ success: boolean; invoice?: Invoice; message?: string }>;

  createInvoice(
    token: string,
    invoice: Invoice
  ): Promise<{ success: boolean; invoice?: Invoice; message?: string }>;

  deleteInvoiceById(
    token: string,
    id: string
  ): Promise<{ success: boolean; message?: string }>;

  changeInvoiceState(
    token: string,
    id: string,
    state: "PAID" | "CANCELLED"
  ): Promise<{ success: boolean; invoice?: Invoice; message?: string }>;
}
