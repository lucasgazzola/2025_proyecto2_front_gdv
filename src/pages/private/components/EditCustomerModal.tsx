import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IdCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useAuth from "@/hooks/useAuth";
import { customerService } from "@/services/factories/customerServiceFactory";
import type { Customer } from "@/types/Customer";

type Props = {
  open: boolean;
  setModalOpen: (v: boolean) => void;
  customer: Customer | null;
  onSave: (customer: Customer, isEdit: boolean) => void;
};

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  dni: "",
  phone: "",
  address: "",
  city: "",
};

export default function EditCustomerModal({
  open,
  setModalOpen,
  customer,
  onSave,
}: Props) {
  const isEdit = customer !== null;
  const { logout, getAccessToken } = useAuth();
  const token = getAccessToken();

  const [form, setForm] = useState<typeof initialForm>(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && customer) {
      setForm({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        dni: customer.dni || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
      });
    } else {
      setForm(initialForm);
    }
  }, [isEdit, customer, open]);

  const handleChange = (
    field: keyof typeof initialForm,
    value: string | boolean
  ) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Por favor, inicia sesión para realizar esta acción.");
      logout();
      return;
    }

    if (!form.firstName || !form.lastName || !form.email || !form.dni) {
      toast.error(
        "Completa los campos obligatorios (nombre, apellido, email, dni)."
      );
      return;
    }

    setLoading(true);
    try {
      if (isEdit && customer) {
        const {
          success,
          customer: updated,
          message,
        } = await customerService.updateCustomerById(token, customer.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          dni: form.dni,
          phone: form.phone,
          address: form.address,
          city: form.city,
        });
        setLoading(false);
        if (!success || !updated) {
          toast.error(message || "No se pudo actualizar el cliente");
          return;
        }
        onSave(updated, true);
        setModalOpen(false);
      } else {
        const {
          success,
          customer: created,
          message,
        } = await customerService.createCustomer(token, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          dni: form.dni,
          phone: form.phone,
          address: form.address,
          city: form.city,
        });
        setLoading(false);
        if (!success || !created) {
          toast.error(message || "No se pudo crear el cliente");
          return;
        }
        onSave(created, false);
        setModalOpen(false);
      }
    } catch {
      setLoading(false);
      toast.error("Error inesperado");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <IdCard className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-gray-800 text-lg font-semibold">
                {isEdit ? "Editar cliente" : "Agregar cliente"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isEdit
                  ? "Modifica los datos del cliente"
                  : "Crea un nuevo cliente"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="grid gap-4 py-4 w-full">
            <div className="space-y-6">
              <div className="flex">
                <Label className="w-1/3 text-gray-600">Nombre*</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="w-2/3"
                />
              </div>
              <div className="flex">
                <Label className="w-1/3 text-gray-600">Apellido*</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="w-2/3"
                />
              </div>
              <div className="flex">
                <Label className="w-1/3 text-gray-600">
                  Correo electrónico*
                </Label>
                <Input
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-2/3"
                />
              </div>
              <div className="flex">
                <Label className="w-1/3 text-gray-600">DNI*</Label>
                <Input
                  value={form.dni}
                  onChange={(e) => handleChange("dni", e.target.value)}
                  className="w-2/3"
                />
              </div>
              <div className="flex">
                <Label className="w-1/3 text-gray-600">Teléfono</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-2/3"
                />
              </div>
              <div className="flex">
                <Label className="w-1/3 text-gray-600">Dirección</Label>
                <Input
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-2/3"
                />
              </div>
              <div className="flex">
                <Label className="w-1/3 text-gray-600">Ciudad</Label>
                <Input
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-2/3"
                />
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setModalOpen(false)}
              className="w-1/2"
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-1/2" disabled={loading}>
              {isEdit ? "Guardar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
