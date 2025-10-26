import { X, CheckCircle, Slash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stateToSet: "PAID" | "CANCELLED";
  invoiceId?: string;
};

export default function ConfirmStateChangeModal({
  isOpen,
  onClose,
  onConfirm,
  stateToSet,
  invoiceId,
}: Props) {
  if (!isOpen) return null;

  const title =
    stateToSet === "PAID" ? "Marcar como pagada" : "Cancelar factura";
  const description =
    stateToSet === "PAID"
      ? "¿Confirma que desea marcar esta factura como pagada? Esta acción actualizará el estado a PAID."
      : "¿Confirma que desea cancelar esta factura? Esta acción actualizará el estado a CANCELLED.";

  const ConfirmIcon = stateToSet === "PAID" ? CheckCircle : Slash;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="relative max-w-lg">
        <button
          aria-label="Cerrar"
          className="absolute top-4 right-4 rounded-md p-2 hover:bg-gray-100"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  stateToSet === "PAID" ? "bg-green-100" : "bg-rose-100"
                }`}
              >
                <ConfirmIcon
                  className={
                    stateToSet === "PAID" ? "text-green-600" : "text-rose-600"
                  }
                  size={20}
                />
              </div>
            </div>

            <div className="text-start flex-1">
              <CardHeader className="p-0">
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="mt-2 text-sm text-muted-foreground">
                  {description}
                </CardDescription>
              </CardHeader>

              {invoiceId && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Factura: #{invoiceId}
                </div>
              )}

              <div className="mt-6 flex items-center gap-3 justify-end">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  className={
                    stateToSet === "PAID"
                      ? "bg-green-600 text-white"
                      : "bg-rose-600 text-white"
                  }
                  onClick={onConfirm}
                >
                  {stateToSet === "PAID"
                    ? "Confirmar pago"
                    : "Confirmar cancelación"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
