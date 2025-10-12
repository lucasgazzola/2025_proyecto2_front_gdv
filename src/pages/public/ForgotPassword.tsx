// src/pages/auth/ForgotPassword.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "@/services/factories/authServiceFactory";
const { forgotPassword } = authService;
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
    <div className="min-h-screen flex items-center justify-center bg-[#c7d7e4] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-8 w-full max-w-md text-center"
      >
        {/* Logo opcional */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo-ati.png"
            alt="Logo ATI"
            className="h-12"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <h2 className="text-xl font-semibold mb-2">Recuperar contraseña</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña
        </p>

        <div className="mb-4 text-left">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="tuli@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cargando..." : "Enviar instrucciones"}
        </Button>

        {/* Volver al inicio */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-blue-700 hover:underline hover:text-blue-900 transition-colors text-sm"
          >
            Volver al inicio
          </button>
        </div>
      </form>
    </div>
  );
}
