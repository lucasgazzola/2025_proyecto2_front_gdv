import { apiEndpoints } from "@/api/endpoints";
import type { Invoice } from "@/types/Invoice";
import type { IInvoiceService } from "@/services/interfaces/IInvoiceService";

class InvoiceServiceReal implements IInvoiceService {
  async getAllInvoices(
    token: string
  ): Promise<{ success: boolean; invoices?: Invoice[]; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.invoices.GET_ALL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as Invoice[];
      return { success: true, invoices: data };
    } catch (error) {
      return { success: false, message: "Error cargando facturas" };
    }
  }

  async getInvoiceById(
    token: string,
    id: string
  ): Promise<{ success: boolean; invoice?: Invoice; message?: string }> {
    try {
      const url = apiEndpoints.invoices.GET_INVOICE(id);
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as Invoice;
      return { success: response.ok, invoice: data };
    } catch (error) {
      return { success: false, message: "Error obteniendo la factura" };
    }
  }

  async createInvoice(
    token: string,
    invoice: Omit<Invoice, "id" | "creator" | "createdAt">
  ): Promise<{ success: boolean; invoice?: Invoice; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.invoices.CREATE_INVOICE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoice),
      });
      if (!response.ok) {
        const text = await response.text();
        return { success: false, message: text };
      }
      const data = (await response.json()) as Invoice;
      return { success: true, invoice: data };
    } catch (error) {
      return { success: false, message: "Error creando la factura" };
    }
  }

  async deleteInvoiceById(
    token: string,
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.invoices.DELETE_INVOICE(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: response.ok };
    } catch (error) {
      return { success: false, message: "Error eliminando la factura" };
    }
  }
}

export const invoiceServiceReal = new InvoiceServiceReal();
