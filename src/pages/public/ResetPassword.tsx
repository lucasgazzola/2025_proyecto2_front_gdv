// src/pages/auth/ResetPassword.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { authService } from "@/services/factories/authServiceFactory";
const { resetPassword: resetPasswordService } = authService;
import { ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [formData, setFormData] = useState({
    tokenPass: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.tokenPass ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { success, message } = await resetPasswordService(
      email,
      formData.tokenPass,
      formData.newPassword,
      formData.confirmPassword
    );
    setLoading(false);
    if (!success) {
      toast.error(message || "Error al restablecer la contraseña.");
      return;
    }

    toast.success("Contraseña restablecida correctamente.");
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#6C94FF]/80 px-4">
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="absolute top-10 left-30 flex items-center gap-2 px-3 py-2 bg-white text-blue-700 hover:text-blue-900 hover:bg-blue-100 transition-colors rounded-md shadow-sm"
        >
          <ArrowLeft className="w-96 h-96" />
        </Button>
      </div>
      <div className="absolute top-6 left-6">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
          <img src="/logo/InvoIQLogo.png" alt="Logo" className="w-10 h-10" />
        </div>
      </div>
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-8 w-full"
        >
          <h1 className="text-3xl font-bold pt-8 pb-10">Ingresar Nueva Contraseña</h1>

          <Label htmlFor="password" className="text-sm font-medium pb-2">
            Nueva Contraseña
          </Label>
          <Input
            type="password"
            name="newPassword"
            placeholder={"Ingresa la nueva contraseña"}
            value={formData.newPassword}
            onChange={handleChange}
            className="mb-3"
            required
          />

          <Label htmlFor="password" className="text-sm font-medium pb-2">
            Confirmar Nueva Contraseña
          </Label>
          <Input
            type="password"
            name="confirmPassword"
            placeholder={"Confirma la nueva contraseña"}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mb-4"
            required
          />

          <Button type="submit" className="w-full h-13 mt-5" disabled={loading}>
            {loading ? "Cargando..." : "Guardar Cambio"}
          </Button>
        </form>
      </div>
    </div>
  );
}
