import React, { useEffect, useState, useRef } from "react";

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
import useAuth from "@/hooks/useAuth";
import { productService } from "@/services/factories/productServiceFactory";

import { z } from "zod";

type Props = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  product: ProductDto | null;
  saveProduct: (product: ProductDto | ProductFormData, isEdit: boolean) => void;
};

export default function EditProductModal({
  open,
  onOpenChange,
  product,
  saveProduct,
}: Props) {
  const isEdit = product !== null;

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
    name: z.string().min(1, "El nombre es obligatorio"),
    brand: z.string().min(1, "La marca es obligatoria"),
    category: z.string().min(1, "La categoría es obligatoria"),
    // imageUrl handled separately (we allow data URLs or remote URLs), keep optional here
    imageUrl: z.string().optional(),
    quantity: z.number().min(0, "La cantidad es obligatoria"),
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof z.infer<typeof productSchema>, string>>
  >({});

  const { getAccessToken } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [_addBrandOpen, setAddBrandOpen] = useState(false);

  // For multi-category selection UI
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Image upload handling
  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // obtener categorías únicas desde los productos registrados
  useEffect(() => {
    const fetchCategories = async () => {
      const token = getAccessToken();
      if (!token) return;
      const { success, products } = await productService.getAllProducts(token);
      if (!success || !products) return;
      const uniqueCats = Array.from(
        new Set(products.map((p) => p.category).filter(Boolean))
      );
      setCategories(uniqueCats);
      const uniqueBrands = Array.from(
        new Set(products.map((p) => p.brand).filter(Boolean))
      );
      setBrands(uniqueBrands);
    };
    fetchCategories();
  }, []);

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
      // populate multi-category selection from joined string
      const catsSelected = product.category
        ? product.category
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      setSelectedCategories(catsSelected);
      setImagePreview(product.imageUrl || "");
    } else {
      setFormFields({
        name: "",
        brand: "",
        category: "",
        imageUrl: "",
        quantity: 0,
        state: true,
      });
      setSelectedCategories([]);
      setImagePreview("");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result));
    };
    reader.readAsDataURL(f);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.imageUrl;
      return newErrors;
    });
  };

  const handleAddCategory = (cat: string) => {
    if (!cat) return;
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev : [...prev, cat]
    );
  };

  const removeCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== cat));
  };

  const _handleAddBrand = (brand: string) => {
    if (!brand) return;
    setBrands((prev) => (prev.includes(brand) ? prev : [...prev, brand]));
    setFormFields((prev) => ({ ...prev, brand }));
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
      // ensure image preview exists (image required)
      if (!imagePreview) {
        setErrors((prev) => ({
          ...prev,
          imageUrl: "La imagen es obligatoria",
        }));
        return;
      }

      const toSave = {
        ...parsed.data,
        id: product!.id,
        brand: parsed.data.brand,
        category: selectedCategories.join(", ") || parsed.data.category,
        imageUrl: imagePreview,
        quantity: parsed.data.quantity,
        state: formFields.state,
      } as ProductDto;

      saveProduct(toSave, isEdit);
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

      if (!imagePreview) {
        setErrors((prev) => ({
          ...prev,
          imageUrl: "La imagen es obligatoria",
        }));
        return;
      }

      // parsed.data coincide con ProductFormData
      const toSave = {
        ...parsed.data,
        brand: parsed.data.brand,
        category: selectedCategories.join(", ") || parsed.data.category,
        imageUrl: imagePreview,
        quantity: parsed.data.quantity,
        state: formFields.state,
      } as ProductFormData;

      saveProduct(toSave, isEdit);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-black text-xl font-semibold mb-1">
            {isEdit ? "Editar producto" : "Crear producto"}
          </DialogTitle>
          <DialogDescription className="text-center text-white text-sm">
            {isEdit
              ? "Modifica los datos generales del producto."
              : "Completa los campos para registrar un nuevo producto."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={handleChange}
                placeholder="Nombre del producto"
                autoComplete="off"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <div className="flex gap-2 items-center">
                <select
                  id="brand"
                  name="brand"
                  value={brand}
                  onChange={(e) =>
                    setFormFields((prev) => ({
                      ...prev,
                      brand: e.target.value,
                    }))
                  }
                  className="flex-1 rounded-md border px-3 py-2 bg-white"
                >
                  <option value="">Marca</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <Button onClick={() => setAddBrandOpen(true)}>
                  Crear marca
                </Button>
              </div>
              {errors.brand && (
                <p className="text-sm text-red-500">{errors.brand}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <div className="flex gap-2">
                <select
                  id="categorySelect"
                  className="flex-1 rounded-md border px-3 py-2 bg-white"
                  onChange={(e) => handleAddCategory(e.target.value)}
                  defaultValue=""
                >
                  <option value="">Categoría</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCategories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-full text-sm"
                  >
                    {c}
                    <button
                      type="button"
                      className="text-xs text-muted-foreground"
                      onClick={() => removeCategory(c)}
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagen</Label>
              <input
                ref={fileInputRef}
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? "Cambiar archivo" : "Elegir archivo"}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {_imageFile?.name ||
                    (imagePreview
                      ? "Archivo seleccionado"
                      : "No hay archivo seleccionado")}
                </span>
              </div>

              {imagePreview && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <div className="text-sm">Preview</div>
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
                </div>
              )}

              {errors.imageUrl && (
                <p className="text-sm text-red-500">{errors.imageUrl}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                name="quantity"
                step="1"
                min={0}
                value={quantity}
                onChange={handleChange}
                placeholder="Cantidad del producto"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex gap-4 items-center">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="state"
                    value="active"
                    checked={formFields.state === true}
                    onChange={() =>
                      setFormFields((prev) => ({ ...prev, state: true }))
                    }
                  />
                  <span>Activo</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="state"
                    value="inactive"
                    checked={formFields.state === false}
                    onChange={() =>
                      setFormFields((prev) => ({ ...prev, state: false }))
                    }
                  />
                  <span>Inactivo</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">
              {isEdit ? "Guardar cambios" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
