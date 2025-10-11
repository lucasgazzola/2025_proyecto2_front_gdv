import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ShowPasswordButton from "@/components/common/ShowPasswordButton";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import { authService } from "@/services/factories/authServiceFactory";
const { register } = authService;

import { userService } from "@/services/factories/userServiceFactory";
const { updateUserByEmail } = userService;

import useAuth from "@/hooks/useAuth";

import type { User } from "@/types/User";
import { Role } from "@/types/Role";

type Props = {
  open: boolean;
  setModalOpen: (val: boolean) => void;
  user: User | null;
  onSave: (user: User, isEdit: boolean) => void;
};

const userSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio."),
    lastname: z.string().min(1, "El apellido es obligatorio."),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres.")
      .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula.")
      .regex(/[a-z]/, "La contraseña debe tener al menos una letra minúscula.")
      .regex(/\d/, "La contraseña debe tener al menos un número."),
    confirmPassword: z
      .string()
      .min(6, "La confirmación de contraseña es obligatoria."),
    hash: z.string().min(1, "El hash es obligatorio."),
    role: z.enum(["user", "superadmin"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type UserFormState = {
  name: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  hash: string;
  role: Role;
  status: "active" | "inactive";
};

const initialFormState: UserFormState = {
  name: "",
  lastname: "",
  email: "",
  password: "",
  confirmPassword: "",
  hash: "",
  role: "user",
  status: "active",
};

export default function EditUserModal({
  open,
  setModalOpen,
  user,
  onSave,
}: Props) {
  const { logout, getAccessToken } = useAuth();
  const isEdit = user !== null;

  const [form, setForm] = useState<UserFormState>(initialFormState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof z.infer<typeof userSchema>, string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = getAccessToken();

  useEffect(() => {
    if (isEdit && user) {
      setForm({
        name: user.name || "",
        lastname: user.lastname || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        hash: "",
        role: user.role || "user",
        status: user.active ? "active" : "inactive",
      });
    } else {
      setForm(initialFormState);
    }
    setErrors({});
  }, [isEdit, user, open]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [id]:
        type === "checkbox"
          ? checked
          : id === "isDemo"
          ? Boolean(checked)
          : value,
    }));
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSelectChange = (
    field: keyof UserFormState,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("No se encontró el token de acceso.");
      logout();
      return;
    }

    if (!isEdit) {
      const parsed = userSchema.safeParse(form);
      if (!parsed.success) {
        const fieldErrors: typeof errors = {};
        for (const err of parsed.error.issues) {
          const field = err.path[0] as keyof typeof fieldErrors;
          if (!fieldErrors[field]) fieldErrors[field] = err.message;
        }
        setErrors(fieldErrors);
        return;
      }
      setLoading(true);
      const { success, message } = await register({
        name: form.name,
        lastname: form.lastname,
        email: form.email,
        password: form.password,
      });
      setLoading(false);

      if (!success) {
        toast.error(
          "Error al crear el usuario. Por favor, intentá nuevamente."
        );
        return;
      }
      // if (createdUser) onSave(createdUser, isEdit);
      setModalOpen(false);
    } else {
      if (!form.name || !form.lastname || !form.status) {
        toast.error("Por favor completá todos los campos obligatorios.");
        return;
      }
      setLoading(true);
      const { success, user: updatedUser } = await updateUserByEmail(
        token,
        form.email,
        {
          name: form.name,
          lastname: form.lastname,
          active: form.status === "active",
        }
      );
      setLoading(false);

      if (!success) {
        toast.error("Error al actualizar el usuario.");
        return;
      }
      if (updatedUser) onSave(updatedUser, isEdit);
      setModalOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-[#2C638B] rounded-t-xl pt-6 pb-5 px-6">
          <DialogTitle className="text-white text-lg font-semibold mb-1">
            {isEdit ? "Editar usuario" : "Crear nuevo usuario"}
          </DialogTitle>
          <DialogDescription className="text-white text-sm">
            {isEdit
              ? "Modifica los datos del usuario seleccionado."
              : "Completa los campos para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={form.name} onChange={handleChange} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname">Apellido</Label>
              <Input
                id="lastname"
                value={form.lastname}
                onChange={handleChange}
                placeholder="Ingresa el apellido"
              />
              {errors.lastname && (
                <p className="text-sm text-red-500">{errors.lastname}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                disabled={isEdit}
                onChange={handleChange}
                placeholder="Ingresa el correo electrónico"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {!isEdit && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Ingresa la contraseña"
                    />
                    <ShowPasswordButton
                      togglePasswordVisibility={() =>
                        setShowPassword((v) => !v)
                      }
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-confirm-password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirma la contraseña"
                    />
                    <ShowPasswordButton
                      togglePasswordVisibility={() =>
                        setShowConfirmPassword((v) => !v)
                      }
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={form.role}
                    onValueChange={(val) =>
                      handleSelectChange("role", val as Role)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="superadmin">
                        Superadministrador
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role}</p>
                  )}
                </div>
              </>
            )}

            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) =>
                    handleSelectChange("status", val as "active" | "inactive")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button disabled={loading} type="submit">
              {isEdit ? "Guardar cambios" : "Agregar usuario"}
              {loading && <LoadingSpinner />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
