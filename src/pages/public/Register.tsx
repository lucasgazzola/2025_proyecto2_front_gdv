import { useState } from "react";
import { Link } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

import ShowPasswordIcon from "@/components/common/ShowPasswordIcon";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import useAuth from "@/hooks/useAuth";
import { z } from "zod";
import type { RegisterFormDto } from "@/dto/RegisterFormDto";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "El nombre es obligatorio."),
    lastName: z.string().min(1, "El apellido es obligatorio."),
    email: z.email("Email inválido.").min(1, "El email es obligatorio."),
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

  const [formData, setFormData] = useState<RegisterFormDto>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

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
    setSubmittedOnce(true);

    // Validación extra: asegurarnos que el usuario aceptó los términos
    if (!acceptTerms) {
      return; // el botón está deshabilitado normalmente, pero protegemos la ruta de submit
    }

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
    <div className="min-h-screen w-full flex items-center justify-center font-inter bg-[#6C94FF]/80">
      <div className="absolute top-6 left-6">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
          <img src="/logo/InvoIQLogo.png" alt="Logo" className="w-10 h-10" />
        </div>
      </div>
      <Card className="w-full max-w-md rounded-xl shadow-lg p-6">
        <h1 className="text-4xl font-bold pt-10">Crear Cuenta</h1>

        <CardContent className="px-6 py-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Nombre</Label>
              <Input
                required
                className="mt-1"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder={"Ingresa tu nombre"}
              />
              {errors.firstName && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <Label>Apellido</Label>
              <Input
                required
                className="mt-1"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder={"Ingresa tu apellido"}
              />
              {errors.lastName && (
                <p className="text-sm text-start text-red-500 mt-1">
                  {errors.lastName}
                </p>
              )}
            </div>
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
            <div className="flex items-start gap-3 mt-2">
              <Checkbox
                checked={acceptTerms}
                onCheckedChange={(v) => setAcceptTerms(Boolean(v))}
              />
              <p className="text-xs text-muted-foreground">
                Al registrarte aceptas nuestros{" "}
                <a href="#" className="underline font-medium text-blue-600">
                  Términos y condiciones
                </a>
              </p>
            </div>
            {submittedOnce && !acceptTerms && (
              <p className="text-sm text-start text-red-500 mt-1">
                Debes aceptar los términos y condiciones para crear una cuenta.
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-13"
              disabled={isLoading || !acceptTerms}
            >
              Crear Cuenta
              {isLoading && <LoadingSpinner />}
            </Button>
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
