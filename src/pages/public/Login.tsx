import { useState } from "react";
import { Link } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent
} from "@/components/ui/card";

import useAuth from "@/hooks/useAuth";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import ShowPasswordButton from "@/components/common/ShowPasswordButton";

import { z } from "zod";

// TODO: remover Zod de aca
const loginSchema = z.object({
  email: z.string().min(1, "El email es obligatorio.").email("Email inválido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

type FormData = z.infer<typeof loginSchema>;

const Login = () => {
  document.title = `Iniciar Sesión | InvoIQ`;

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof z.infer<typeof loginSchema>, string>>
  >({});

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined })); // Clear error for this field
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse(formData);

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
    await login(parsed.data);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-inter bg-[#6C94FF]/80 relative">
      <div className="absolute top-6 left-6">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
          <img src="/logo/InvoIQLogo.png" alt="Logo" className="w-10 h-10" />
        </div>
      </div>
      <Card className="w-full max-w-md rounded-xl shadow-lg p-6">
        <h1 className="text-4xl font-bold pt-10">Iniciar Sesión</h1>

        <CardContent className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ingrese su correo electrónico"
                className="mt-1"
              />
              {errors.email && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  className="mt-1 pr-10"
                />
                <ShowPasswordButton
                  togglePasswordVisibility={togglePasswordVisibility}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.password}
                </p>
              )}
            </div>
            <div className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-13"
              disabled={isLoading}
            >
              Iniciar Sesión
              {isLoading && <LoadingSpinner />}
            </Button>

            <div className="text-center text-sm mt-4">
              No tengo una cuenta{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Regístrate aquí
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
