import React, { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";

import { toast } from "react-toastify";

import type { RegisterFormDto } from "@/dto/RegisterFormDto";
import type { LoginFormDto } from "@/dto/LoginFormDto";
import { authService } from "@/services/factories/authServiceFactory";
const {
  login: loginService,
  register: registerService,
  // validateToken: validateTokenService,
  logout: logoutService,
} = authService;
import { userService } from "@/services/factories/userServiceFactory";
const { getUserProfile } = userService;
import {
  removeLoggedUserData,
  storeLoggedUserData,
  storeNewAccessToken,
} from "@/utils/localStorage";
import { isPublicRoute } from "@/routes";
import { AuthContext } from "../AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const pathname = window.location.pathname;

  const isPublicPathname = isPublicRoute(pathname);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [name, setName] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      setAuthLoading(true);

      //TODO: TOKEN NECESITA SER VALIDADO
      const validAccessToken = getAccessToken();

      if (validAccessToken) {
        const { success, user } = await getUserProfile(validAccessToken);

        if (!success) {
          setIsLoggedIn(false);
          setAuthLoading(false);
          removeLoggedUserData();
          toast.error("Error al obtener el perfil del usuario");
          navigate("/login");
          return;
        }
        if (!user) {
          setIsLoggedIn(false);
          setAuthLoading(false);
          removeLoggedUserData();
          toast.error("Error al decodificar el token de acceso");
          navigate("/login");
          return;
        }
        setName(user.name);
        setLastname(user.lastname);
        setEmail(user.email);
        setRole(user.role);

        storeLoggedUserData({
          email: user.email,
          name: user.name,
          lastname: user.lastname,
          role: user.role,
        });

        setIsLoggedIn(true);
        setAuthLoading(false);

        // Si está en login o register y ya está autenticado, lo sacamos
        if (isPublicPathname) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate(pathname);
        }
      } else {
        setIsLoggedIn(false);
        setAuthLoading(false);
        setName("");
        setLastname("");
        setEmail("");
        setRole("");

        removeLoggedUserData();

        // Mostrar el toast solo si no está en ruta pública
        if (!isPublicPathname) {
          toast.error(
            "Sesión expirada o no válida. Por favor, inicia sesión de nuevo."
          );
        }

        // Si no está logueado, llevar a login salvo que ya esté ahí
        if (!isPublicPathname) {
          navigate("/login", { replace: true });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lógica para validar el token de acceso actual
  // y, si es necesario, refrescarlo usando el token de refresco.

  const register = async ({
    name,
    lastname,
    email,
    password,
  }: RegisterFormDto): Promise<void> => {
    const { success, message } = await registerService({
      name,
      lastname,
      email,
      password,
    });

    if (!success) {
      toast.error(message || "Error al iniciar sesión");
      return;
    }
    toast.success(
      "Usuario registrado correctamente. Revisa tu email para activar la cuenta."
    );
    navigate("/login");
  };

  const login = async ({ email, password }: LoginFormDto): Promise<void> => {
    setAuthLoading(true);
    const {
      success,
      message,
      accessToken,
      user: loggedUser,
    } = await loginService({
      email,
      password,
    });

    setAuthLoading(false);
    if (!success || !loggedUser || !accessToken) {
      toast.error(message || "Credenciales inválidas");
      return;
    }

    setName(loggedUser.name);
    setLastname(loggedUser.lastname);
    setRole(loggedUser.role);
    setEmail(loggedUser.email);
    setIsLoggedIn(true);

    storeNewAccessToken(accessToken);

    storeLoggedUserData({
      email: loggedUser.email,
      name: loggedUser.name,
      lastname: loggedUser.lastname,
      role: loggedUser.role,
    });

    toast.success("Sesión iniciada correctamente");
    navigate("/");
  };

  const getAccessToken = (): string | null => {
    return window.localStorage.getItem("access_token") || null;
  };

  const logout = async () => {
    const accessToken = getAccessToken();

    setAuthLoading(true);
    if (accessToken) {
      await logoutService(accessToken);
    }
    setAuthLoading(false);
    setIsLoggedIn(false);
    setName("");
    setLastname("");
    setRole("");
    setEmail("");

    removeLoggedUserData();

    toast.success("Sesión cerrada correctamente");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        name,
        lastname,
        email,
        role,
        isLoggedIn,
        authLoading,
        setName,
        setLastname,
        getAccessToken,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
