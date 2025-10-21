import React, { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";

import { toast } from "react-toastify";

import type { RegisterFormDto } from "@/dto/RegisterFormDto";
import type { LoginFormDto } from "@/dto/LoginFormDto";
import { authService } from "@/services/factories/authServiceFactory";
const {
  login: loginService,
  register: registerService,
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
import { tokenService } from "@/services/factories/tokenServiceFactory";
const { validateToken } = tokenService;

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

      const accessToken = getAccessToken();
      if (!accessToken) {
        setIsLoggedIn(false);
        setAuthLoading(false);

        removeLoggedUserData();

        // Si no está logueado, llevar a login salvo que ya esté ahí
        if (!isPublicPathname) {
          navigate("/login", { replace: true });
        }
        return;
      }

      const { success: isValidAccessToken } = await validateToken(accessToken);

      if (!isValidAccessToken) {
        setIsLoggedIn(false);
        setAuthLoading(false);

        removeLoggedUserData();

        // Mostrar el toast solo si no está en ruta pública
        if (!isPublicPathname) {
          toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        }

        // Si no está logueado, llevar a login salvo que ya esté ahí
        if (!isPublicPathname) {
          navigate("/login", { replace: true });
        }
        return;
      }

      const { success, user, message } = await getUserProfile(accessToken);

      if (!success) {
        setIsLoggedIn(false);
        setAuthLoading(false);
        removeLoggedUserData();
        toast.error(message || "Error al obtener el perfil del usuario");
        navigate("/login");
        return;
      }
      if (!user) {
        setIsLoggedIn(false);
        setAuthLoading(false);
        removeLoggedUserData();
        toast.error(message || "Error al decodificar el token");
        navigate("/login");
        return;
      }
      setName(user.firstName);
      setLastname(user.lastName);
      setEmail(user.email);
      setRole(user.role);

      storeLoggedUserData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });

      setIsLoggedIn(true);
      setAuthLoading(false);

      if (isPublicPathname) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate(pathname);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = async ({
    firstName,
    lastName,
    email,
    password,
  }: Omit<RegisterFormDto, "confirmPassword">): Promise<void> => {
    const { success, message } = await registerService({
      firstName,
      lastName,
      email,
      password,
    });

    if (!success) {
      toast.error(message || "Error al iniciar sesión");
      return;
    }
    toast.success(
      "Usuario registrado correctamente. Inicia sesión para continuar."
    );
    navigate("/login");
  };

  const login = async ({ email, password }: LoginFormDto): Promise<void> => {
    setAuthLoading(true);
    const { success, message, accessToken } = await loginService({
      email,
      password,
    });

    setAuthLoading(false);
    if (!success || !accessToken) {
      toast.error(message || "Credenciales inválidas");
      return;
    }

    const {
      success: profileSuccess,
      user: loggedUser,
      message: profileMessage,
    } = await getUserProfile(accessToken);

    if (!profileSuccess) {
      toast.error(profileMessage || "Error al obtener el perfil del usuario");
      return;
    }
    if (!loggedUser) {
      toast.error("Error al decodificar el token");
      return;
    }

    // Si todo va bien, seteamos los datos del usuario

    setName(loggedUser.firstName);
    setLastname(loggedUser.lastName);
    setRole(loggedUser.role);
    setEmail(loggedUser.email);
    setIsLoggedIn(true);

    storeNewAccessToken(accessToken);

    storeLoggedUserData({
      email: loggedUser.email,
      firstName: loggedUser.firstName,
      lastName: loggedUser.lastName,
      role: loggedUser.role,
    });

    toast.success("Sesión iniciada correctamente");
    navigate("/");
  };

  const getAccessToken = (): string | null => {
    return window.localStorage.getItem("accessToken") || null;
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
