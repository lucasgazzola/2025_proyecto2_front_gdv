import React, { useEffect, useState, useRef } from "react";

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
import { Tag, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import { z } from "zod";
import type { Brand, BrandFormData } from "@/types/Brand";

type Props = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  brand: Brand | null;
  saveBrand: (brand: Brand | BrandFormData, isEdit: boolean) => void;
  // Optional callback invoked whenever the modal actually closes (cancel or after save)
  onClose?: () => void;
};

export default function EditBrandModal({
  open,
  onOpenChange,
  brand,
  saveBrand,
  onClose,
}: Props) {
  const isEdit = brand !== null;

  const [formFields, setFormFields] = useState({
    logo: "",
    name: "",
    description: "",
    isActive: true,
  });

  const { name, logo, description, isActive } = formFields;

  const brandSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "El nombre es obligatorio"),
    logo: z.string().min(1, "El logo es obligatorio"),
    description: z.string(),
    isActive: z.boolean(),
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof z.infer<typeof brandSchema>, string>>
  >({});

  // Image upload handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEdit && brand) {
      setFormFields({
        name: brand.name,
        logo: brand.logo,
        description: brand.description,
        isActive: brand.isActive,
      });
      // populate multi-category selection from joined string

      setImagePreview(brand.logo || "");
    } else {
      setFormFields({
        name: "",
        logo: "",
        description: "",
        isActive: true,
      });
      setImagePreview("");
    }
  }, [isEdit, brand]);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreview(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [imageFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormFields((prev) => {
      if (name === "quantity") {
        return { ...prev, [name]: Number(value) };
      }
      return { ...prev, [name]: value };
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name as keyof typeof prev];
      return newErrors;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setFormFields((prev) => ({ ...prev, logo: f.name }));
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result));
    };
    reader.readAsDataURL(f);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.logo;
      return newErrors;
    });
  };

  // Nota: la creación de marca se abre desde el botón y actualmente no necesita lógica adicional aquí.

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEdit) {
      // SI SE ESTA EDITANDO LA MARCA
      const parsed = brandSchema.safeParse({
        id: String(brand?.id || ""),
        name,
        logo,
        description,
        isActive,
      });

      if (!parsed.success) {
        const fieldErrors: Partial<
          Record<keyof z.infer<typeof brandSchema>, string>
        > = {};
        parsed.error.issues.forEach((issue: z.ZodIssue) => {
          fieldErrors[issue.path[0] as keyof z.infer<typeof brandSchema>] =
            issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      // ensure image preview exists (image required)
      if (!imagePreview) {
        setErrors((prev) => ({
          ...prev,
          logo: "La imagen es obligatoria",
        }));
        return;
      }

      const toSave = {
        ...parsed.data,
        name: parsed.data.name,
        description: parsed.data.description,
        logo: parsed.data.logo || imagePreview,
        isActive: parsed.data.isActive,
      } as Brand;

      saveBrand(toSave, isEdit);

      onClose && onClose();
    } else {
      // SI ES UNA NUEVA MARCA
      const parsed = brandSchema.safeParse({
        name,
        logo,
        description,
        isActive,
      });

      if (!parsed.success) {
        const fieldErrors: Partial<
          Record<keyof z.infer<typeof brandSchema>, string>
        > = {};
        parsed.error.issues.forEach((issue: z.core.$ZodIssue) => {
          fieldErrors[issue.path[0] as keyof z.infer<typeof brandSchema>] =
            issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      if (!imagePreview) {
        setErrors((prev) => ({
          ...prev,
          logo: "La imagen es obligatoria",
        }));
        return;
      }

      // parsed.data coincide con ProductFormData
      const toSave = {
        ...parsed.data,
        name: parsed.data.name,
        description: parsed.data.description,
        isActive: parsed.data.isActive,
        logo: parsed.data.logo || imagePreview,
      } as BrandFormData;
      saveBrand(toSave, isEdit);
      // Close the dialog and notify parent
      try {
        onOpenChange(false);
      } catch (err) {
        /* noop */
      }
      onClose && onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Tag className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-gray-800 text-lg font-semibold">
                {isEdit ? "Editar Marca" : "Agrega una nueva marca"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isEdit
                  ? "Modifica los datos generales de la marca."
                  : "Este formulario permitirá añadir una nueva marca a la base de datos"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={(e) => handleSave(e)}>
          <div className="grid gap-4 py-4 w-full">
            <div className="space-y-6">
              <div className="flex">
                <Label
                  htmlFor="image"
                  className="text-nowrap text-gray-500 w-2/5"
                >
                  Logo*
                </Label>
                <input
                  ref={fileInputRef}
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Upload card */}
                <div className="w-3/5 flex flex-col">
                  <div
                    className="border-dashed border-2 border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center gap-3 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Click para cargar o arrastra y suelta
                    </div>
                    <div className="text-xs text-muted-foreground">
                      SVG, PNG, JPG or GIF (max. 800x400px)
                    </div>
                  </div>

                  {/* TODO: Agregar que tenga más imagenes */}
                  {imagePreview && (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-28 h-28 object-cover rounded"
                      />
                      <button
                        type="button"
                        className="text-xs text-rose-600"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
                {errors.logo && (
                  <p className="text-sm text-red-500">{errors.logo}</p>
                )}
              </div>

              <div className="flex">
                <Label
                  htmlFor="name"
                  className="text-nowrap text-gray-500 w-2/5"
                >
                  Nombre de la marca*
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  className="w-3/5"
                  onChange={handleChange}
                  placeholder="Nombre de la marca"
                  autoComplete="off"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* descripción o espacio extra */}
              <div className="flex">
                <Label
                  className="text-nowrap text-gray-500 w-2/5"
                  htmlFor="description"
                >
                  Descripción
                </Label>
                <Textarea
                  name="description"
                  className="w-3/5 min-h-[120px]"
                  placeholder="Descripción de la marca"
                  value={description}
                  onChange={(e) =>
                    setFormFields((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex">
                <Label
                  className="text-nowrap text-gray-500 w-2/5"
                  htmlFor="state"
                >
                  Estado*
                </Label>
                <div className="flex gap-10 justify-center w-3/5">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="isActive"
                      value="active"
                      checked={formFields.isActive === true}
                      onChange={() =>
                        setFormFields((prev) => ({ ...prev, isActive: true }))
                      }
                    />
                    <span>Activo</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="isActive"
                      value="inactive"
                      checked={formFields.isActive === false}
                      onChange={() =>
                        setFormFields((prev) => ({ ...prev, isActive: false }))
                      }
                    />
                    <span>Inactivo</span>
                  </label>
                </div>
              </div>
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
    </Dialog>
  );
}
