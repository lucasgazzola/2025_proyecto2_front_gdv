import { apiEndpoints } from "@/api/endpoints";
import { type User } from "@/types/User";
import type { IUserService } from "@/services/interfaces/IUserService";

class UserServiceReal implements IUserService {
  async getAllUsers(
    token: string
  ): Promise<{ success: boolean; message?: string; users?: User[] }> {
    try {
      const response = await fetch(apiEndpoints.users.GET_ALL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }
      const users: User[] = await response.json();
      return {
        success: true,
        users: users,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al obtener los usuarios",
      };
    }
  }

  async getUserByEmail(
    token: string,
    email: string
  ): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const response = await fetch(
        apiEndpoints.users.GET_USER_BY_EMAIL(email),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios");
      }
      const user: User = await response.json();
      return {
        success: true,
        user: user,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al obtener los usuarios",
      };
    }
  }

  async getUserProfile(
    token: string
  ): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const response = await fetch(apiEndpoints.users.GET_PROFILE, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener el perfil del usuario");
      }
      const user: User = await response.json();
      return {
        success: true,
        user: user,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al obtener el perfil del usuario",
      };
    }
  }

  async updateUserByEmail(
    token: string,
    userEmail: string,
    user: Partial<User>
  ): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const response = await fetch(
        apiEndpoints.users.UPDATE_USER_BY_EMAIL(userEmail),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(user),
        }
      );
      if (!response.ok) {
        throw new Error("Error al actualizar el usuario");
      }
      const updatedUser = (await response.json()) as User;
      return {
        success: true,
        user: updatedUser,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al actualizar el usuario",
      };
    }
  }

  async changePassword(
    token: string,
    email: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.users.CHANGE_PASSWORD(email), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
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
    } catch {
      return { success: false, message: "Error al conectar con el servidor" };
    }
  }

  async updateUserProfile(
    token: string,
    user: Partial<User>
  ): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const response = await fetch(apiEndpoints.users.UPDATE_USER_PROFILE, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el perfil del usuario");
      }
      const userProfile = (await response.json()) as User;
      return {
        success: true,
        user: userProfile,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al actualizar el perfil del usuario",
      };
    }
  }
}

export const userServiceReal = new UserServiceReal();
