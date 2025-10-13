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
import { Package, Upload, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import type { ProductDto, ProductFormData } from "@/types/Product";
import useAuth from "@/hooks/useAuth";
import { productService } from "@/services/factories/productServiceFactory";

import { z } from "zod";
import EditBrandModal from "./EditBrandModal";
import type { Brand, BrandFormData } from "@/types/Brand";

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
  const [brands, setBrands] = useState<BrandDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);


  // Brand modal state
  const [brandModalOpen, setBrandModalOpen] = useState(false);

  // For multi-category selection UI
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Image upload handling
  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // obtener categorías únicas desde los productos registrados
  useEffect(() => {
    const fetchData = async () => {
      const token = getAccessToken();
      if (!token) return;

      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          axios.get(apiEndpoints.brands.GET_ALL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(apiEndpoints.categories.GET_ALL, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setBrands(brandsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.warn("Backend no disponible, usando datos mock");

        // Datos simulados para desarrollo
        setBrands([
          { id: "mock1", name: "Intel" },
          { id: "mock2", name: "AMD" },
          { id: "mock3", name: "NVIDIA" },
        ]);

        setCategories([
          { id: "cat1", name: "Procesadores" },
          { id: "cat2", name: "Placas madre" },
          { id: "cat3", name: "Tarjetas gráficas" },
        ]);
      }
    };

    fetchData();
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

  // Nota: la creación de marca se abre desde el botón y actualmente no necesita lógica adicional aquí.

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
        brand: formFields.brand, // ← ID de marca
        category: selectedCategories.join(","), // ← IDs de categorías separados por coma
        imageUrl: imagePreview,
        quantity: parsed.data.quantity,
        state: formFields.state,
      } as ProductFormData;


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
  //Para guardar cuando se crea una marca desde el modal de marcas
  const saveBrand = (b: Brand | BrandFormData, _isEdit: boolean) => {
    const name = (b as Brand | BrandFormData).name || "";
    if (!name) {
      setBrandModalOpen(false);
      return;
    }
    setBrands((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setFormFields((prev) => ({ ...prev, brand: name }));
    setBrandModalOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-gray-800 text-lg font-semibold">
                {isEdit ? "Editar producto" : "Agrega un nuevo producto"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {isEdit
                  ? "Modifica los datos generales del producto."
                  : "Este formulario permitirá añadir un nuevo producto a la base de datos"}
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
                  Nombre del producto*
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  className="w-3/5"
                  onChange={handleChange}
                  placeholder="e.g. Core I9 14900K"
                  autoComplete="off"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="flex">
                <Label
                  htmlFor="brand"
                  className="text-nowrap text-gray-500 w-2/5"
                >
                  Marca*
                </Label>
                <div className="flex gap-2 items-center w-3/5">
                  <Select
                    value={brand}
                    onValueChange={(val: string) =>
                      setFormFields((prev) => ({ ...prev, brand: val }))
                    }
                  >
                    <SelectTrigger className="flex-1 rounded-md border px-3 py-2 bg-white">
                      <SelectValue placeholder="Marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="default"
                    onClick={() => setBrandModalOpen(true)}
                    type="button"
                  >
                    Agregar Marca
                  </Button>
                </div>
                {errors.brand && (
                  <p className="text-sm text-red-500">{errors.brand}</p>
                )}
              </div>
              <div className="flex">
                <Label
                  htmlFor="image"
                  className="text-nowrap text-gray-500 w-2/5"
                >
                  Imagen del producto*
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
                {errors.imageUrl && (
                  <p className="text-sm text-red-500">{errors.imageUrl}</p>
                )}
              </div>

              <div className="flex">
                <Label
                  className="text-nowrap text-gray-500 w-2/5"
                  htmlFor="quantity"
                >
                  Stock*
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  name="quantity"
                  step="1"
                  min={0}
                  value={quantity}
                  onChange={handleChange}
                  placeholder="Ingrese cantidad"
                  className="w-3/5"
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity}</p>
                )}
              </div>

              <div className="flex">
                <Label
                  className="text-nowrap text-gray-500 w-2/5"
                  htmlFor="category"
                >
                  Categorías*
                </Label>
                <div className="flex flex-col w-3/5 items-start">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex w-full items-center justify-between text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        type="button"
                      >
                        Seleccionar categorías
                        <ChevronDown className="ml-2 size-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-[300px]">
                      {categories.map((c) => (
                        <DropdownMenuCheckboxItem
                          key={c.id}
                          checked={selectedCategories.includes(c.id)}
                          onCheckedChange={(v: boolean) => {
                            if (v) handleAddCategory(c.id);
                            else removeCategory(c.id);
                          }}
                        >
                          {c.name}
                        </DropdownMenuCheckboxItem>
                      ))}

                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCategories.map((id) => {
                      const cat = categories.find((c) => c.id === id);
                      return (
                        <span key={id} className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                          <span className="text-[#5932EA] font-medium">{cat?.name}</span>
                          <button
                            type="button"
                            className="text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => removeCategory(id)}
                            aria-label={`Eliminar categoría ${cat?.name}`}
                          >
                            <span className="text-[#5932EA]">×</span>
                          </button>
                        </span>
                      );
                    })}
                  </div>

                </div>

                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
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
                  placeholder="Descripción del nuevo producto"
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
        <EditBrandModal
          open={brandModalOpen}
          onOpenChange={(v: boolean) => setBrandModalOpen(v)}
          brand={null}
          saveBrand={saveBrand}
        />
    </Dialog>
  );
}
