import { useState } from "react";
import { Link } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import ShowPasswordIcon from "@/components/common/ShowPasswordIcon";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import useAuth from "@/hooks/useAuth";
import { z } from "zod";

type RegisterForm = {
  name: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio."),
    lastname: z.string().min(1, "El apellido es obligatorio."),
    email: z
      .string()
      .min(1, "El email es obligatorio.")
      .email("Email inválido."),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres.")
      .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula.")
      .regex(/[a-z]/, "La contraseña debe tener al menos una letra minúscula.")
      .regex(/\d/, "La contraseña debe tener al menos un número."),
    confirmPassword: z.string().min(1, "Debes confirmar la contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export default function Register() {
  window.document.title = "Registrarse | GDV";

  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterForm>({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof z.infer<typeof registerSchema>, string>>
  >({});

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const err of parsed.error.issues) {
        const field = err.path[0] as keyof typeof fieldErrors;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const { confirmPassword, ...data } = formData;

    setIsLoading(true);
    await register(data);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-inter bg-[#c7d7e4]">
      <Card className="w-full max-w-md rounded-xl shadow-lg p-6">
        <CardHeader className="bg-[#2C638B] rounded-t-xl pt-6 pb-5 px-6">
          <div className="flex items-start text-start">
            <div>
              <CardTitle className="text-white text-lg font-semibold mb-1">
                Registrarse
              </CardTitle>
              <CardDescription className="text-white text-sm">
                Crea tu cuenta para comenzar a gestionar tus ventas.
              </CardDescription>
            </div>
            <img
              src="/logo-login.png"
              alt="Logo Login"
              className="h-16 ml-4 mt-10"
            />
          </div>
        </CardHeader>

        <CardContent className="px-6 py-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Correo electrónico</Label>
              <Input
                required
                className="mt-1"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={"Ingresa tu correo electrónico"}
              />
              {errors.email && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label>Nombre</Label>
              <Input
                required
                className="mt-1"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={"Ingresa tu nombre"}
              />
              {errors.name && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label>Apellido</Label>
              <Input
                required
                className="mt-1"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder={"Ingresa tu apellido"}
              />
              {errors.lastname && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.lastname}
                </p>
              )}
            </div>

            <div>
              <Label>Contraseña</Label>
              <div className="relative">
                <Input
                  required
                  className="mt-1"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={"Ingresa tu contraseña"}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <ShowPasswordIcon />
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <Label>Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  required
                  className="mt-1"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={"Reingresa la contraseña"}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <ShowPasswordIcon />
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-4 bg-[#2C638B] text-white"
              disabled={isLoading}
            >
              Registrarse
              {isLoading && <LoadingSpinner />}
            </Button>

            <p className="text-center text-xs mt-2 text-muted-foreground">
              Al registrarte aceptas nuestros{" "}
              <a href="#" className="underline font-medium text-blue-600">
                Términos y condiciones
              </a>
            </p>
          </form>

          <div className="text-center text-sm mt-4">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
