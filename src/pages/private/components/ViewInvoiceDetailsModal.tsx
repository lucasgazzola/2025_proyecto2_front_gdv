import { useMemo } from "react";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import type { Invoice } from "@/types/Invoice";

export default function ViewInvoiceDetailsModal({
  open,
  onOpenChange,
  selectedInvoice,
  setSelectedInvoice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInvoice?: Invoice | null;
  setSelectedInvoice?: (i: Invoice | null) => void;
}) {
  // close handler: mirror other modals behaviour
  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val && setSelectedInvoice) setSelectedInvoice(null);
  };

  const items = selectedInvoice?.invoiceDetails ?? [];

  const calculatedSubtotal = useMemo(
    () => items.reduce((s, it) => s + (it.subtotal || 0), 0),
    [items]
  );

  if (!selectedInvoice) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col py-16 px-10 bg-white rounded-lg shadow-2xl ring-1 ring-black/5 transform-gpu transition-all duration-200">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-primary/10 p-3 transition-transform duration-200 hover:scale-105">
                <FileText
                  size={28}
                  strokeWidth={1.5}
                  className="text-primary"
                />
              </div>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-gray-800 text-lg font-semibold">
                Factura
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {selectedInvoice.id} •{" "}
                {selectedInvoice.createdAt
                  ? new Date(selectedInvoice.createdAt).toLocaleString()
                  : "—"}
              </DialogDescription>
            </div>
            <div className="text-right">
              <div className="font-semibold">InvoIQ</div>
              <div className="text-sm text-muted-foreground">
                RUC: 20-12345678-9
              </div>
              <div className="text-sm text-muted-foreground">
                Tel: +54 9 11 1234-5678
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <Card className="p-4">
            <div className="flex justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Cliente</div>
                <div className="font-medium">
                  {selectedInvoice.creator.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedInvoice.creator.email}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Factura</div>
                <div className="font-medium">{selectedInvoice.id}</div>
                <div className="text-sm text-muted-foreground">
                  Emitida:{" "}
                  {selectedInvoice.createdAt
                    ? new Date(selectedInvoice.createdAt).toLocaleDateString()
                    : "—"}
                </div>
              </div>
            </div>
          </Card>

          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2">Cant.</th>
                  <th className="py-2">Descripción</th>
                  <th className="py-2 text-right">Precio unit.</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr
                    key={it.id}
                    className="border-b hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-3 px-2 align-center w-14">
                      {it.quantity}
                    </td>
                    <td className="py-3 align-top">
                      <div className="font-medium">{it.product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Proveedor: {it.provider.name}
                      </div>
                    </td>
                    <td className="py-3 align-center text-right">
                      ${(it.unitPrice || 0).toLocaleString()}
                    </td>
                    <td className="py-3 align-center text-right font-semibold">
                      ${(it.subtotal || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-1 text-sm">
                <div className="text-muted-foreground">Subtotal</div>
                <div>${calculatedSubtotal.toLocaleString()}</div>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <div className="text-muted-foreground">Impuestos (0%)</div>
                <div>$0.00</div>
              </div>
              <div className="border-t my-2" />
              <div className="flex justify-between py-1 text-lg font-bold">
                <div>Total</div>
                <div>
                  $
                  {(
                    selectedInvoice.priceTotal || calculatedSubtotal
                  ).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
