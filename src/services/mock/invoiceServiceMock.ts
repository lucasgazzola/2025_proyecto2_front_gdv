import type { Invoice } from "@/types/Invoice";
import type { IInvoiceService } from "../interfaces/IInvoiceService";

const invoicesMock: Invoice[] = [];

class InvoiceServiceMock implements IInvoiceService {
  async getAllInvoices(_token: string) {
  return { success: true, invoices: invoicesMock };
  };

  async getInvoiceById(_token: string, id: string) {
    const inv = invoicesMock.find((i) => i.id === id);
    return { success: !!inv, invoice: inv };
  };

  async createInvoice(_token: string, invoice: Invoice) {
    const newInvoice = { ...invoice, id: String(Date.now()), createdAt: new Date().toISOString() };
    invoicesMock.push(newInvoice);
    return { success: true, invoice: newInvoice };
  };

  async deleteInvoiceById(_token: string, id: string) {
    const idx = invoicesMock.findIndex((i) => i.id === id);
    if (idx >= 0) {
      invoicesMock.splice(idx, 1);
      return { success: true };
    }
    return { success: false, message: "Factura no encontrada" };
  };
};
export const invoiceServiceMock = new InvoiceServiceMock();