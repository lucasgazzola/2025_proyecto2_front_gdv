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
    brand: "",
    category: "",
    imageUrl: "",
    quantity: 0,
    state: true,
  });

  const { name, brand, category, imageUrl, quantity } = formFields;

  const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, t("products.nameRequired")),
    brand: z.string().min(1, "La marca es obligatoria"),
    category: z.string().min(1, "La categoría es obligatoria"),
    imageUrl: z.string().url("URL de imagen inválida").optional(),
    quantity: z.number().min(0, t("products.quantityRequired")),
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof z.infer<typeof productSchema>, string>>
  >({});

  useEffect(() => {
    if (isEdit && product) {
      setFormFields({
        name: product.name,
        brand: product.brand,
        category: product.category,
        imageUrl: product.imageUrl || "",
        quantity: product.quantity,
        state: product.state,
      });
    } else {
      setFormFields({
        name: "",
        brand: "",
        category: "",
        imageUrl: "",
        quantity: 0,
        state: true,
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
        brand,
        category,
        imageUrl,
        quantity
      });

      if (!parsed.success) {
        const fieldErrors: Partial<
          Record<keyof z.infer<typeof productSchema>, string>
        > = {};
        parsed.error.issues.forEach((issue: z.ZodIssue) => {
          fieldErrors[issue.path[0] as keyof z.infer<typeof productSchema>] =
            issue.message;
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
        brand,
        category,
        imageUrl,
        quantity,
      });

      if (!parsed.success) {
        const fieldErrors: Partial<
          Record<keyof z.infer<typeof productSchema>, string>
        > = {};
        parsed.error.issues.forEach((issue: z.ZodIssue) => {
          fieldErrors[issue.path[0] as keyof z.infer<typeof productSchema>] =
            issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      // parsed.data coincide con ProductFormData
      saveProduct(parsed.data as ProductFormData, isEdit);
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
              <Label htmlFor="brand">{t("products.brand")}</Label>
              <Input
                id="brand"
                name="brand"
                type="text"
                value={brand}
                onChange={handleChange}
                placeholder={t("products.brand")}
                autoComplete="off"
              />
              {errors.brand && (
                <p className="text-sm text-red-500">{errors.brand}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t("products.category")}</Label>
              <Input
                id="category"
                name="category"
                type="text"
                value={category}
                onChange={handleChange}
                placeholder={t("products.category")}
                autoComplete="off"
              />
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">{t("products.image")}</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="text"
                value={imageUrl}
                onChange={handleChange}
                placeholder={t("products.image")}
                autoComplete="off"
              />
              {errors.imageUrl && (
                <p className="text-sm text-red-500">{errors.imageUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">{t("products.quantityLabel")}</Label>
              <Input
                id="quantity"
                type="number"
                name="quantity"
                step="1"
                min={0}
                value={quantity}
                onChange={handleChange}
                placeholder={t("products.quantityPlaceholder")}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="state"
                name="state"
                type="checkbox"
                checked={formFields.state}
                onChange={(e) =>
                  setFormFields((prev) => ({ ...prev, state: e.target.checked }))
                }
              />
              <Label htmlFor="state">{t("products.state")}</Label>
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
