import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import useAuth from "@/hooks/useAuth";
import ShowPasswordButton from "@/components/common/ShowPasswordButton";
import { toast } from "react-toastify";
import { authService } from "@/services/factories/authServiceFactory";

const { changePassword } = authService;
import { z } from "zod";

type FormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProfileChangePasswordModalProps = {
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
}: ProfileChangePasswordModalProps) => {
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
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
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
    setIsLoading(true);
    const { success, message } = await changePassword(
      token,
      email,
      formData.oldPassword,
      formData.newPassword,
      formData.confirmPassword
    );
    setIsLoading(false);
    if (success) {
      toast.success("Contraseña cambiada correctamente.");
      setPasswordModalOpen(false);
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(message || "Error al cambiar la contraseña.");
    }
  };

  if (!passwordModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-md rounded-xl shadow-lg p-6">
        <CardHeader className="bg-[#2C638B] rounded-t-xl pt-6 pb-5 px-6">
          <CardTitle className="text-white text-lg font-semibold mb-1">
            Cambiar contraseña
          </CardTitle>
          <CardDescription className="text-white text-sm">
            Ingresa tu contraseña actual y la nueva contraseña para
            actualizarla.
          </CardDescription>
        </CardHeader>
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
                onClick={() => setPasswordModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#2C638B] hover:bg-[#25597e] text-white font-semibold"
                disabled={isLoading}
              >
                Cambiar contraseña
                {isLoading && <span className="ml-2 animate-spin">⏳</span>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileChangePasswordModal;
