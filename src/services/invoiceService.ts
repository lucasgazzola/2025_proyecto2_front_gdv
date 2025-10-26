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
      const data = (await response.json()) as any[];
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

      const normalized = (data || []).map((inv: any) => {
        // source may use invoiceDetails or items; total or priceTotal
        const rawItems =
          inv.items ?? inv.invoiceDetails ?? inv.invoice_details ?? [];
        const items = (rawItems || []).map((it: any) => {
          const prod = it.product ?? it.products ?? it.productId ?? null;
          const rawImage = prod
            ? prod.imageUrl ?? prod.imageURL ?? prod.image ?? ""
            : "";
          const imageUrl =
            rawImage && !rawImage.startsWith("http")
              ? `${API_BASE_URL}/${rawImage}`
              : rawImage;
          const brand = prod?.brand
            ? {
                ...prod.brand,
                id: String((prod.brand as any).id ?? ""),
                logo:
                  prod.brand.logo && !prod.brand.logo.startsWith("http")
                    ? `${API_BASE_URL}/${prod.brand.logo}`
                    : prod.brand.logo,
              }
            : prod?.brand;

          const product = prod
            ? {
                ...prod,
                id: String(prod.id ?? ""),
                imageUrl,
                brand,
                categories: (prod.categories || []).map((c: any) => ({
                  ...c,
                  id: String(c.id ?? ""),
                })),
              }
            : prod;

          return {
            id: String(it.id ?? it.invoiceDetailId ?? ""),
            product,
            quantity: it.quantity,
            unitPrice: it.unitPrice ?? it.price ?? 0,
            subtotal: it.subtotal ?? it.lineTotal ?? 0,
          };
        });

        const normalizedInv: any = {
          id: String(inv.id ?? ""),
          creator: inv.user ?? inv.creator ?? inv.createdBy,
          // customer may be under different keys (customer, user, client)
          customer: inv.customer ?? inv.user ?? inv.client ?? null,
          priceTotal: inv.priceTotal ?? inv.total ?? inv.amount ?? 0,
          createdAt: inv.createdAt,
          updatedAt: inv.updatedAt,
        };
        normalizedInv.invoiceDetails = items;
        normalizedInv.items = items;
        return normalizedInv as Invoice;
      });

      return { success: true, invoices: normalized };
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
      const data = (await response.json()) as any;
      if (!data) return { success: response.ok };
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const rawItems =
        data.items ?? data.invoiceDetails ?? data.invoice_details ?? [];
      const items = (rawItems || []).map((it: any) => {
        const prod = it.product ?? null;
        const rawImage = prod
          ? prod.imageUrl ?? prod.imageURL ?? prod.image ?? ""
          : "";
        const imageUrl =
          rawImage && !rawImage.startsWith("http")
            ? `${API_BASE_URL}/${rawImage}`
            : rawImage;
        const brand = prod?.brand
          ? {
              ...prod.brand,
              id: String((prod.brand as any).id ?? ""),
              logo:
                prod.brand.logo && !prod.brand.logo.startsWith("http")
                  ? `${API_BASE_URL}/${prod.brand.logo}`
                  : prod.brand.logo,
            }
          : prod?.brand;

        const product = prod
          ? {
              ...prod,
              id: String(prod.id ?? ""),
              imageUrl,
              brand,
              categories: (prod.categories || []).map((c: any) => ({
                ...c,
                id: String(c.id ?? ""),
              })),
            }
          : prod;

        return {
          id: String(it.id ?? it.invoiceDetailId ?? ""),
          product,
          quantity: it.quantity,
          unitPrice: it.unitPrice ?? it.price ?? 0,
          subtotal: it.subtotal ?? it.lineTotal ?? 0,
        };
      });

      const normalizedInv: any = {
        id: String(data.id ?? ""),
        creator: data.user ?? data.creator ?? data.createdBy,
        // customer may be under different keys
        customer: data.customer ?? data.user ?? data.client ?? null,
        priceTotal: data.priceTotal ?? data.total ?? data.amount ?? 0,
        createdAt: data.createdAt,
      };
      normalizedInv.invoiceDetails = items;
      normalizedInv.items = items;
      return { success: response.ok, invoice: normalizedInv as Invoice };
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
      const data = (await response.json()) as any;
      // reuse normalization logic
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const rawItems =
        data.items ?? data.invoiceDetails ?? data.invoice_details ?? [];
      const items = (rawItems || []).map((it: any) => {
        const prod = it.product ?? null;
        const rawImage = prod
          ? prod.imageUrl ?? prod.imageURL ?? prod.image ?? ""
          : "";
        const imageUrl =
          rawImage && !rawImage.startsWith("http")
            ? `${API_BASE_URL}/${rawImage}`
            : rawImage;
        const brand = prod?.brand
          ? {
              ...prod.brand,
              id: String((prod.brand as any).id ?? ""),
              logo:
                prod.brand.logo && !prod.brand.logo.startsWith("http")
                  ? `${API_BASE_URL}/${prod.brand.logo}`
                  : prod.brand.logo,
            }
          : prod?.brand;

        const product = prod
          ? {
              ...prod,
              id: String(prod.id ?? ""),
              imageUrl,
              brand,
              categories: (prod.categories || []).map((c: any) => ({
                ...c,
                id: String(c.id ?? ""),
              })),
            }
          : prod;

        return {
          id: String(it.id ?? it.invoiceDetailId ?? ""),
          product,
          quantity: it.quantity,
          unitPrice: it.unitPrice ?? it.price ?? 0,
          subtotal: it.subtotal ?? it.lineTotal ?? 0,
        };
      });

      const normalizedInv: any = {
        id: String(data.id ?? ""),
        creator: data.user ?? data.creator ?? data.createdBy,
        // customer may be under different keys
        customer: data.customer,
        priceTotal: data.priceTotal ?? data.total ?? data.amount ?? 0,
        createdAt: data.createdAt,
      };
      normalizedInv.invoiceDetails = items;
      normalizedInv.items = items;
      return { success: true, invoice: normalizedInv as Invoice };
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
