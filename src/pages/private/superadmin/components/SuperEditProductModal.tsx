import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import type { ProductDto, ProductFormData } from "@/types/Product";
import { useLanguage } from "@/hooks/useLanguage";

import { z } from "zod";

type Props = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  product: ProductDto | null;
  saveProduct: (product: ProductDto | ProductFormData, isEdit: boolean) => void;
};

export default function SuperEditProductModal({
  open,
  onOpenChange,
  product,
  saveProduct,
}: Props) {
  const isEdit = product !== null;

  const { t } = useLanguage();

  const [formFields, setFormFields] = useState({
    name: "",
    idEcommerce: "",
    quantity: 0,
  });

  const { name, idEcommerce, quantity } = formFields;

  const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, t("products.nameRequired")),
    idEcommerce: z.string().min(1, t("products.idEcommerceRequired")),
    quantity: z.number().min(1, t("products.quantityRequired")),
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof z.infer<typeof productSchema>, string>>
  >({});

  useEffect(() => {
    if (isEdit && product) {
      setFormFields({
        name: product.name,
        idEcommerce: product.idEcommerce,
        quantity: product.quantity,
      });
    } else {
      setFormFields({
        name: "",
        idEcommerce: "",
        quantity: 0,
      });
    }
  }, [isEdit, product]);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      // Validación para edición
      const parsed = productSchema.safeParse({
        id: product.id,
        name,
        idEcommerce,
        quantity,
      });

      if (!parsed.success) {
        const fieldErrors: Partial<
          Record<keyof z.infer<typeof productSchema>, string>
        > = {};
        parsed.error.errors.forEach((error) => {
          fieldErrors[error.path[0] as keyof z.infer<typeof productSchema>] =
            error.message;
        });
        setErrors(fieldErrors);
        return;
      }
      // const productToSave: ProductDto = {
      //   id: product.id, // solo necesario para edición
      //   name,
      //   idEcommerce,
      //   quantity,
      // };

      saveProduct(parsed.data, isEdit);
    } else {
      const parsed = productSchema.safeParse({
        name,
        idEcommerce,
        quantity,
      });

      if (!parsed.success) {
        const fieldErrors: Partial<
          Record<keyof z.infer<typeof productSchema>, string>
        > = {};
        parsed.error.errors.forEach((error) => {
          fieldErrors[error.path[0] as keyof z.infer<typeof productSchema>] =
            error.message;
        });
        setErrors(fieldErrors);
        return;
      }

      saveProduct(parsed.data, isEdit);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-[#2C638B] rounded-t-xl pt-6 pb-5 px-6">
          <DialogTitle className="text-white text-lg font-semibold mb-1">
            {isEdit ? t("products.editTitle") : t("products.createTitle")}
          </DialogTitle>
          <DialogDescription className="text-white text-sm">
            {isEdit
              ? t("products.editDescription")
              : t("products.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("products.nameLabel")}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={handleChange}
                placeholder={t("products.namePlaceholder")}
                autoComplete="off"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idEcommerce">
                {t("products.idEcommerceLabel")}
              </Label>
              <Input
                id="idEcommerce"
                name="idEcommerce"
                type="text"
                value={idEcommerce}
                onChange={handleChange}
                placeholder={t("products.idEcommercePlaceholder")}
                autoComplete="off"
              />
              {errors.idEcommerce && (
                <p className="text-sm text-red-500">{errors.idEcommerce}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">{t("products.quantityLabel")}</Label>
              <Input
                id="quantity"
                type="number"
                name="quantity"
                step="1"
                min={1}
                value={quantity}
                onChange={handleChange}
                placeholder={t("products.quantityPlaceholder")}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">
              {isEdit ? t("products.saveChanges") : t("products.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
