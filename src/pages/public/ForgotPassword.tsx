// src/pages/auth/ForgotPassword.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "@/services/factories/authServiceFactory";
const { forgotPassword } = authService;
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-[#c7d7e4] px-4">
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="absolute top-10 left-10 flex items-center gap-2 px-3 py-2 bg-white text-blue-700 hover:text-blue-900 hover:bg-blue-100 transition-colors rounded-md shadow-sm"
        >
          <ArrowLeft className="w-96 h-96" />
        </Button>
      </div>
      <div></div>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">Restablecer contraseña</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Ingrese su dirección de correo electrónico para recibir un código de
          restablecimiento.
        </p>

        <Input
          type="email"
          placeholder="Ingrese su correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? "Cargando..." : "Enviar código"}
        </Button>
      </form>
    </div>
  );
}
