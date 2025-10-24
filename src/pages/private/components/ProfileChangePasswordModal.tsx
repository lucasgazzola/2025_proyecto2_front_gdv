import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import useAuth from "@/hooks/useAuth";
import ShowPasswordButton from "@/components/common/ShowPasswordButton";
import { toast } from "react-toastify";
import { userService } from "@/services/factories/userServiceFactory";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KeyRound } from "lucide-react";

type FormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type Props = {
  token: string;
  passwordModalOpen: boolean;
  setPasswordModalOpen: (open: boolean) => void;
};

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, "Contraseña actual inválida."),
    newPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres.")
      .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula.")
      .regex(/[a-z]/, "La contraseña debe tener al menos una letra minúscula.")
      .regex(/\d/, "La contraseña debe tener al menos un número."),
    confirmPassword: z.string().min(1, "Debes confirmar la contraseña."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

const ProfileChangePasswordModal = ({
  token,
  passwordModalOpen,
  setPasswordModalOpen,
}: Props) => {
  const { email, logout } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // limpiar formulario cuando se cierra el modal
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
      setShowPassword({ old: false, new: false, confirm: false });
    }
    setPasswordModalOpen(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) {
      toast.error("Error de autenticación. Por favor inicia sesión de nuevo.");
      logout();
      return;
    }
    const parsed = changePasswordSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const err of parsed.error.issues) {
        const field = err.path[0] as keyof typeof fieldErrors;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }
    const { success, message } = await userService.changePassword(
      token,
      email,
      formData.oldPassword,
      formData.newPassword,
      formData.confirmPassword
    );
    if (success) {
      toast.success("Contraseña cambiada correctamente.");
      setPasswordModalOpen(false);
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(message || "Error al cambiar la contraseña.");
    }
  };

  return (
    <Dialog open={passwordModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <KeyRound className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-gray-800 text-lg font-semibold">
                Cambiar contraseña
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Ingresa tu contraseña actual y la nueva contraseña para
                actualizarla.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <CardContent className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword" className="text-sm font-medium">
                Contraseña actual
              </Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type={showPassword.old ? "text" : "password"}
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  placeholder={"Ingresa la contraseña actual"}
                  className="mt-1 pr-10"
                />
                <ShowPasswordButton
                  togglePasswordVisibility={() =>
                    togglePasswordVisibility("old")
                  }
                />
              </div>
              {errors.oldPassword && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.oldPassword}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium">
                Nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder={"Ingresa la nueva contraseña"}
                  className="mt-1 pr-10"
                />
                <ShowPasswordButton
                  togglePasswordVisibility={() =>
                    togglePasswordVisibility("new")
                  }
                />
              </div>
              {errors.newPassword && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={"Confirma la nueva contraseña"}
                  className="mt-1 pr-10"
                />
                <ShowPasswordButton
                  togglePasswordVisibility={() =>
                    togglePasswordVisibility("confirm")
                  }
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-1/2"
                onClick={() => setPasswordModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="default"
                className="w-1/2"
              >
                Cambiar contraseña
              </Button>
            </div>
          </form>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileChangePasswordModal;
