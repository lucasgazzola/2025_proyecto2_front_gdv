import { apiEndpoints } from "@/api/endpoints";
import type { LoginFormDto, LoginResponseDto } from "@/dto/LoginFormDto";
// import { jwtDecode as jwtDecodeService } from "jwt-decode";
import type { RegisterFormDto } from "@/dto/RegisterFormDto";

import type { IAuthService } from "@/services/interfaces/IAuthService";

import { userService } from "@/services/factories/userServiceFactory";
const { getUserProfile } = userService;

class AuthServiceReal implements IAuthService {
  async login({ email, password }: LoginFormDto): Promise<LoginResponseDto> {
    try {
      const response = await fetch(apiEndpoints.auth.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          return {
            success: false,
            message: errorData.message || "Cuenta no verificada",
          };
        }
        return {
          success: false,
          message: errorData.message || "Credenciales inválidas",
        };
      }
      if (response.status === 200) {
        const data = (await response.json()) as {
          accessToken: string;
          refreshToken: string;
        };
        const { accessToken, refreshToken } = data;
        const { success, user, message } = await getUserProfile(accessToken);
        if (!success) {
          return {
            success: false,
            message: message || "Error al obtener el perfil del usuario",
          };
        }
        if (!user) {
          return {
            success: false,
            message: "Error al decodificar el token",
          };
        }
        return {
          success: true,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
      }
      return {
        success: false,
        message: "Error al iniciar sesión",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error al conectar con el servidor",
      };
    }
  }

  async register(
    data: RegisterFormDto
  ): Promise<{ success: boolean; message?: string }> {
    // ...existing code...
    try {
      const requestBody: Partial<RegisterFormDto> = { ...data };
      const response = await fetch(apiEndpoints.auth.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (response.status !== 201) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Error al registrarse",
        };
      }
      return {
        success: true,
        message: "Usuario registrado correctamente",
      };
    } catch (error) {
      return {
        success: false,
        message: "Error al conectar con el servidor",
      };
    }
  }

  async logout(token: string): Promise<{ success: boolean; message?: string }> {
    // ...existing code...
    try {
      const response = await fetch(apiEndpoints.auth.LOGOUT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        return { success: true, message: "Sesión cerrada correctamente" };
      }
      return { success: false, message: "Error al cerrar sesión" };
    } catch (error) {
      return { success: false, message: "Error al cerrar sesión" };
    }
  }

  async resetPassword(
    email: string,
    tokenPass: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    // ...existing code...
    try {
      const response = await fetch(
        apiEndpoints.auth.RESET_PASSWORD(email, tokenPass),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: newPassword,
            password_confirm: confirmPassword,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Error al restablecer la contraseña",
        };
      }
      return {
        success: true,
        message: "Contraseña restablecida correctamente",
      };
    } catch (error) {
      return { success: false, message: "Error al conectar con el servidor" };
    }
  }

  async changePassword(
    token: string,
    email: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    // ...existing code...
    try {
      const response = await fetch(apiEndpoints.auth.CHANGE_PASSWORD, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          old_password: oldPassword,
          new_password: newPassword,
          password_confirm: confirmPassword,
        }),
      });
      if (!response.ok) {
        if (response.status === 400) {
          return { success: false, message: "Contraseña actual incorrecta" };
        }
        const errorData = (await response.json()) as { message: string };
        return {
          success: false,
          message: errorData.message || "Error al cambiar la contraseña",
        };
      }
      return { success: true, message: "Contraseña cambiada correctamente" };
    } catch (error) {
      return { success: false, message: "Error al conectar con el servidor" };
    }
  }

  async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message?: string }> {
    // ...existing code...
    try {
      const response = await fetch(apiEndpoints.auth.FORGOT_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `${email}`,
      });
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message:
            errorData.message || "Error al enviar el correo de recuperación",
        };
      }
      return {
        success: true,
        message: "Correo de recuperación enviado correctamente",
      };
    } catch (error) {
      return { success: false, message: "Error al conectar con el servidor" };
    }
  }

  async regenerateOtp(data: {
    token: string;
    email: string;
  }): Promise<{ success: boolean; message?: string }> {
    // ...existing code...
    try {
      const response = await fetch(
        apiEndpoints.auth.REGENERATE_OTP(data.email),
        {
          method: "GET",
          headers: { Authorization: `Bearer ${data.token}` },
        }
      );
      if (!response.ok) throw new Error("Error al regenerar OTP");
      return { success: true, message: "OTP regenerado correctamente" };
    } catch (error) {
      return { success: false, message: "Error al regenerar OTP" };
    }
  }
}

export const authServiceReal = new AuthServiceReal();
