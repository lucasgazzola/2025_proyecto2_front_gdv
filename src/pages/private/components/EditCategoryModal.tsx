import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tag } from "lucide-react";
import { z } from "zod";
import type { Category, CategoryFormData } from "@/types/Category";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
  saveCategory: (cat: Category | CategoryFormData, isEdit: boolean) => void;
};

export default function EditCategoryModal({ open, onOpenChange, category, saveCategory }: Props) {
  const isEdit = category !== null;
  const [form, setForm] = useState({ id: "", name: "", description: "" });
  const { id, name, description } = form;

  const schema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional(),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof z.infer<typeof schema>, string>>>({});

  useEffect(() => {
    if (isEdit && category) {
      setForm({ id: category.id, name: category.name, description: category.description || "" });
    } else {
      setForm({ id: "", name: "", description: "" });
    }
  }, [isEdit, category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => {
      const newErrors = { ...p } as Partial<Record<keyof z.infer<typeof schema>, string>>;
      delete newErrors[name as keyof z.infer<typeof schema>];
      return newErrors;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = isEdit ? { id, name, description } : { name, description };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof z.infer<typeof schema>, string>> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as keyof z.infer<typeof schema>] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    saveCategory(parsed.data as Category | CategoryFormData, isEdit);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Tag className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">{isEdit ? "Editar categoría" : "Agregar categoría"}</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">{isEdit ? "Modifica la categoría" : "Crea una nueva categoría"}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="grid gap-4 py-4 w-full">
            <div className="flex">
              <Label htmlFor="name" className="text-nowrap text-gray-500 w-2/5">Nombre*</Label>
              <Input id="name" name="name" value={name} onChange={handleChange} className="w-3/5" />
            </div>
            <div className="flex">
              <Label htmlFor="description" className="text-nowrap text-gray-500 w-2/5">Descripción</Label>
              <Input id="description" name="description" value={description} onChange={handleChange} className="w-3/5" />
            </div>
            <div className="flex w-full items-center gap-3">
              <Button variant="outline" className="w-1/2" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button className="w-1/2" type="submit">{isEdit ? "Guardar cambios" : "Confirmar"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
