import type { Invoice } from "@/types/Invoice";
import type { IInvoiceService } from "../interfaces/IInvoiceService";
import { PRODUCTS } from "./productServiceMock";
import { PROVIDERS } from "./providerServiceMock";
import { USERS } from "./userServiceMock";

// Helpers to generate realistic invoice and detail IDs (no 'mock' in ids)
function pad(n: number) {
  return String(n).padStart(2, "0");
}

function yyyymmdd(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate()
  )}`;
}

function randomSuffix(len = 6) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + len)
    .toUpperCase();
}

function genInvoiceId(date = new Date()) {
  return `${yyyymmdd(date)}-${randomSuffix(6)}`;
}

function genDetailId(invoiceId: string, idx: number) {
  return `${invoiceId}-D${String(idx).padStart(2, "0")}`;
}

const INVOICES: Invoice[] = [
  // Invoice 1: Cliente compró una laptop + SSD
  (() => {
    const d1 = PRODUCTS[0]; // Acer Aspire
    const d2 = PRODUCTS[9]; // SSD Samsung 1TB
    const qty1 = 1;
    const qty2 = 2;
    const invoiceId = genInvoiceId(
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
    );
    const line1 = {
      id: genDetailId(invoiceId, 1),
      product: d1,
      provider: PROVIDERS[0],
      quantity: qty1,
      unitPrice: d1.price,
      subtotal: Number((d1.price * qty1).toFixed(2)),
    };
    const line2 = {
      id: genDetailId(invoiceId, 2),
      product: d2,
      provider: PROVIDERS[1],
      quantity: qty2,
      unitPrice: d2.price,
      subtotal: Number((d2.price * qty2).toFixed(2)),
    };
    const priceTotal = Number((line1.subtotal + line2.subtotal).toFixed(2));
    return {
      id: invoiceId,
      creator: USERS[0],
      invoiceDetails: [line1, line2],
      priceTotal,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    };
  })(),

  // Invoice 2: Armado de PC - placa, ram, fuente
  (() => {
    const invoiceId = genInvoiceId(
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
    );
    const p1 = PRODUCTS[11]; // Placa Madre ASUS Prime
    const p2 = PRODUCTS[12]; // Memoria RAM
    const p3 = PRODUCTS[10]; // Fuente Corsair
    const line1 = {
      id: genDetailId(invoiceId, 1),
      product: p1,
      provider: PROVIDERS[3],
      quantity: 1,
      unitPrice: p1.price,
      subtotal: Number((p1.price * 1).toFixed(2)),
    };
    const line2 = {
      id: genDetailId(invoiceId, 2),
      product: p2,
      provider: PROVIDERS[3],
      quantity: 2,
      unitPrice: p2.price,
      subtotal: Number((p2.price * 2).toFixed(2)),
    };
    const line3 = {
      id: genDetailId(invoiceId, 3),
      product: p3,
      provider: PROVIDERS[3],
      quantity: 1,
      unitPrice: p3.price,
      subtotal: Number((p3.price * 1).toFixed(2)),
    };
    const priceTotal = Number(
      (line1.subtotal + line2.subtotal + line3.subtotal).toFixed(2)
    );
    return {
      id: invoiceId,
      creator: USERS[0],
      invoiceDetails: [line1, line2, line3],
      priceTotal,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    };
  })(),

  // Invoice 3: Oficina - monitores y peripherals
  (() => {
    const invoiceId = genInvoiceId(
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
    );
    const p1 = PRODUCTS[6]; // Monitor Samsung Curvo
    const p2 = PRODUCTS[7]; // Mouse
    const p3 = PRODUCTS[19]; // Webcam
    const line1 = {
      id: genDetailId(invoiceId, 1),
      product: p1,
      provider: PROVIDERS[2],
      quantity: 2,
      unitPrice: p1.price,
      subtotal: Number((p1.price * 2).toFixed(2)),
    };
    const line2 = {
      id: genDetailId(invoiceId, 2),
      product: p2,
      provider: PROVIDERS[4],
      quantity: 2,
      unitPrice: p2.price,
      subtotal: Number((p2.price * 2).toFixed(2)),
    };
    const line3 = {
      id: genDetailId(invoiceId, 3),
      product: p3,
      provider: PROVIDERS[7],
      quantity: 1,
      unitPrice: p3.price,
      subtotal: Number((p3.price * 1).toFixed(2)),
    };
    const priceTotal = Number(
      (line1.subtotal + line2.subtotal + line3.subtotal).toFixed(2)
    );
    return {
      id: invoiceId,
      creator: USERS[1] ?? USERS[0],
      invoiceDetails: [line1, line2, line3],
      priceTotal,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    };
  })(),

  // Invoice 4: Licencias de software
  (() => {
    const invoiceId = genInvoiceId(
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
    );
    const p1 = PRODUCTS[15]; // Office 365
    const p2 = PRODUCTS[16]; // Antivirus
    const line1 = {
      id: genDetailId(invoiceId, 1),
      product: p1,
      provider: PROVIDERS[5],
      quantity: 3,
      unitPrice: p1.price,
      subtotal: Number((p1.price * 3).toFixed(2)),
    };
    const line2 = {
      id: genDetailId(invoiceId, 2),
      product: p2,
      provider: PROVIDERS[5],
      quantity: 2,
      unitPrice: p2.price,
      subtotal: Number((p2.price * 2).toFixed(2)),
    };
    const priceTotal = Number((line1.subtotal + line2.subtotal).toFixed(2));
    return {
      id: invoiceId,
      creator: USERS[0],
      invoiceDetails: [line1, line2],
      priceTotal,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    };
  })(),

  // Invoice 5: Cableado y accesorios
  (() => {
    const invoiceId = genInvoiceId(
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
    );
    const p1 = PRODUCTS[18]; // Cables HDMI
    const p2 = PRODUCTS[8]; // Teclado
    const line1 = {
      id: genDetailId(invoiceId, 1),
      product: p1,
      provider: PROVIDERS[4],
      quantity: 5,
      unitPrice: p1.price,
      subtotal: Number((p1.price * 5).toFixed(2)),
    };
    const line2 = {
      id: genDetailId(invoiceId, 2),
      product: p2,
      provider: PROVIDERS[4],
      quantity: 1,
      unitPrice: p2.price,
      subtotal: Number((p2.price * 1).toFixed(2)),
    };
    const priceTotal = Number((line1.subtotal + line2.subtotal).toFixed(2));
    return {
      id: invoiceId,
      creator: USERS[1] ?? USERS[0],
      invoiceDetails: [line1, line2],
      priceTotal,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    };
  })(),

  // Invoice 6: Disco y puesta a punto
  (() => {
    const invoiceId = genInvoiceId(
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
    );
    const p1 = PRODUCTS[17]; // Disco Duro 2TB
    const p2 = PRODUCTS[9]; // SSD 1TB
    const line1 = {
      id: genDetailId(invoiceId, 1),
      product: p1,
      provider: PROVIDERS[1],
      quantity: 1,
      unitPrice: p1.price,
      subtotal: Number((p1.price * 1).toFixed(2)),
    };
    const line2 = {
      id: genDetailId(invoiceId, 2),
      product: p2,
      provider: PROVIDERS[1],
      quantity: 1,
      unitPrice: p2.price,
      subtotal: Number((p2.price * 1).toFixed(2)),
    };
    const priceTotal = Number((line1.subtotal + line2.subtotal).toFixed(2));
    return {
      id: invoiceId,
      creator: USERS[0],
      invoiceDetails: [line1, line2],
      priceTotal,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    };
  })(),
];

class InvoiceServiceMock implements IInvoiceService {
  async getAllInvoices(
    _token: string
  ): Promise<{ success: boolean; invoices?: Invoice[]; message?: string }> {
    return Promise.resolve({ success: true, invoices: INVOICES });
  }

  async getInvoiceById(
    _token: string,
    id: string
  ): Promise<{ success: boolean; invoice?: Invoice; message?: string }> {
    const invoice = INVOICES.find((i) => i.id === id);
    if (!invoice) {
      return Promise.resolve({
        success: false,
        message: "Factura no encontrada",
      });
    }
    return Promise.resolve({ success: true, invoice });
  }

  async createInvoice(
    _token: string,
    invoice: Omit<Invoice, "id" | "creator" | "createdAt">
  ): Promise<{ success: boolean; invoice?: Invoice; message?: string }> {
    const invoiceId = genInvoiceId();
    const details = (invoice.invoiceDetails || []).map((d, idx) => {
      const unitPrice = d.unitPrice ?? d.product?.price ?? 0;
      const quantity = d.quantity ?? 1;
      const subtotal = d.subtotal ?? Number((unitPrice * quantity).toFixed(2));
      return {
        ...d,
        id: genDetailId(invoiceId, idx + 1),
        unitPrice,
        quantity,
        subtotal,
      };
    });

    const newInvoice: Invoice = {
      ...invoice,
      id: invoiceId,
      creator: USERS[0],
      invoiceDetails: details,
      createdAt: new Date().toISOString(),
    } as Invoice;

    INVOICES.push(newInvoice);
    return Promise.resolve({ success: true, invoice: newInvoice });
  }

  async deleteInvoiceById(
    _token: string,
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    const index = INVOICES.findIndex((i) => i.id === id);
    if (index !== -1) {
      INVOICES.splice(index, 1);
      return Promise.resolve({ success: true });
    } else {
      return Promise.resolve({
        success: false,
        message: "Factura no encontrada",
      });
    }
  }
}
export const invoiceServiceMock = new InvoiceServiceMock();
