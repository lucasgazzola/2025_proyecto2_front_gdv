// src/pages/auth/ForgotPassword.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "@/services/factories/authServiceFactory";
const { forgotPassword } = authService;
import { ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingrese su correo electrónico.");
      return;
    }

    setLoading(true);
    const { success } = await forgotPassword(email);
    setLoading(false);

    if (success) {
      toast.success("Código de restablecimiento enviado a su correo.");
      navigate("/reset-password", { state: { email } });
    } else {
      toast.error("Error al enviar el código de restablecimiento.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#6C94FF]/80 px-4">
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
      <div></div>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
      >
        <h1 className="text-4xl font-bold pt-8 pb-10">Recuperar Contraseña</h1>
        <Label htmlFor="email" className="text-sm font-medium pb-2">
          Email
        </Label>
        <Input
          type="email"
          placeholder="Ingrese su correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" className="w-full h-13 mt-10" disabled={loading}>
          {loading ? "Cargando..." : "Enviar código"}
        </Button>
      </form>
    </div>
  );
}
