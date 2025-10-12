import { Trash, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <Card className="relative max-w-xl">
        {/* Close button top-right */}
        <button
          aria-label="Cerrar"
          className="absolute top-4 right-4 rounded-md p-2 hover:bg-gray-100"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <CardContent className="p-4">
          <div className="flex items-start gap-4 w-fit">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
                <Trash className="text-red-600" size={20} />
              </div>
            </div>

            <div className="text-start">
              <CardHeader className="p-0">
                <CardTitle className="text-xl">Eliminar registro</CardTitle>
                <CardDescription>
                  ¿Está seguro que desea eliminar este registro? Esta acción no
                  puede deshacerse.
                </CardDescription>
              </CardHeader>

              <div className="mt-6 flex gap-4 xl:gap-20 items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm">
                  <Input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 rounded"
                  />
                  No volver a mostrar
                </label>

                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    className="text-white"
                    variant="destructive"
                    onClick={onConfirm}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
