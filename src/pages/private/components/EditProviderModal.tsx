import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

import { z } from "zod";
import type { Provider, ProviderFormData } from "@/types/Provider";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-toastify";

type Props = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  provider: Provider | null;
  saveProvider: (
    provider: Provider | ProviderFormData,
    isEdit: boolean
  ) => void;
};

export default function EditProviderModal({
  open,
  onOpenChange,
  provider,
  saveProvider,
}: Props) {
  const isEdit = provider !== null;

  const [formFields, setFormFields] = useState({
    code: "",
    name: "",
    email: "",
    address: "",
    city: "",
  });

  const { code, name, email, address, city } = formFields;

  const providerSchema = z.object({
    id: z.string().optional(),
    code: z.string().min(1, "El código es obligatorio"),
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z
      .email("El email no es válido")
      .min(1, "El email es obligatorio")
      .optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof z.infer<typeof providerSchema>, string>>
  >({});

  const { getAccessToken } = useAuth();
  const [providerModalOpen, setProviderModalOpen] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección.");
      return;
    }
    if (isEdit && provider) {
      setFormFields({
        code: provider.code || "",
        name: provider.name,
        email: provider.email || "",
        address: provider.address || "",
        city: provider.city || "",
      });
    } else {
      setFormFields({ code: "", name: "", address: "", city: "", email: "" });
    }
  }, [isEdit, provider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: name === "productsCount" ? Number(value) : value,
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name as keyof typeof prev];
      return newErrors;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      const parsed = providerSchema.safeParse({
        id: provider!.id,
        code,
        name,
        email,
        address,
        city,
      });
      if (!parsed.success) {
        const fieldErrors: Partial<
          Record<keyof z.infer<typeof providerSchema>, string>
        > = {};
        parsed.error.issues.forEach((issue) => {
          fieldErrors[issue.path[0] as keyof z.infer<typeof providerSchema>] =
            issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      console.log(parsed.data);
      const toSave = parsed.data as Provider;
      saveProvider(toSave, isEdit);
    } else {
      const parsed = providerSchema.safeParse({
        code,
        name,
        email,
        address,
        city,
      });

      if (!parsed.success) {
        const fieldErrors: Partial<
          Record<keyof z.infer<typeof providerSchema>, string>
        > = {};
        parsed.error.issues.forEach((issue) => {
          fieldErrors[issue.path[0] as keyof z.infer<typeof providerSchema>] =
            issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      const toSave = parsed.data as ProviderFormData;
      saveProvider(toSave, isEdit);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Building2 className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-gray-800 text-lg font-semibold">
                {isEdit ? "Editar Proveedor" : "Agregar Proveedor"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isEdit
                  ? "Modifica los datos del proveedor."
                  : "Complete los datos para crear un nuevo proveedor."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="grid gap-4 py-4 w-full">
            <div className="space-y-6">
              <div className="flex">
                <Label
                  htmlFor="name"
                  className="text-nowrap text-gray-500 w-2/5"
                >
                  Nombre*
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  className="w-3/5"
                  autoComplete="off"
                />
              </div>
              <div className="w-3/5 ml-auto">
                {errors.name && (
                  <p className="text-sm text-start text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="flex">
                <Label
                  htmlFor="code"
                  className="text-nowrap text-gray-500 w-2/5"
                >
                  Codigo*
                </Label>
                <Input
                  id="code"
                  name="code"
                  type="string"
                  value={String(code)}
                  onChange={handleChange}
                  className="w-3/5"
                  autoComplete="off"
                />
              </div>
              <div className="w-3/5 ml-auto">
                {errors.code && (
                  <p className="text-sm text-start text-red-500">
                    {errors.code}
                  </p>
                )}
              </div>

              <div className="flex">
                <Label
                  htmlFor="email"
                  className="text-nowrap text-gray-500 w-2/5"
                >
                  Correo electrónico*
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  className="w-3/5"
                  autoComplete="off"
                />
              </div>
              <div className="w-3/5 ml-auto">
                {errors.email && (
                  <p className="text-sm text-start text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="flex">
                <Label
                  htmlFor="address"
                  className="text-nowrap text-gray-500 w-2/5"
                >
                  Direccion
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={address}
                  onChange={handleChange}
                  className="w-3/5"
                  autoComplete="off"
                />
              </div>
              <div className="w-3/5 ml-auto">
                {errors.address && (
                  <p className="text-sm text-start text-red-500">
                    {errors.address}
                  </p>
                )}
              </div>
              <div className="flex">
                <Label
                  htmlFor="city"
                  className="text-nowrap text-gray-500 w-2/5"
                >
                  Ciudad
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={city}
                  onChange={handleChange}
                  className="w-3/5"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="mt-4 mb-2">
              <div className="flex w-full items-center gap-3">
                <Button
                  variant="outline"
                  className="w-1/2"
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button className="w-1/2" type="submit" variant="default">
                  {isEdit ? "Guardar cambios" : "Confirmar"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
      {providerModalOpen && (
        <EditProviderModal
          open={providerModalOpen}
          onOpenChange={(v: boolean) => setProviderModalOpen(v)}
          provider={null}
          saveProvider={saveProvider}
        />
      )}
    </Dialog>
  );
}
