import { apiEndpoints } from "@/api/endpoints";
import { userDtoToUser, type User, type UserDto } from "@/types/User";
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
      const usersDto: UserDto[] = await response.json();
      return {
        success: true,
        users: usersDto.map((user) => userDtoToUser(user)),
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
      const userDto: UserDto = await response.json();
      return {
        success: true,
        user: userDtoToUser(userDto),
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
      const userDto: UserDto = await response.json();
      return {
        success: true,
        user: userDtoToUser(userDto),
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

  async updateUserProfile(
    token: string,
    user: { email: string } & Partial<Omit<User, "email">>
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.auth.CHANGE_DATA, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el perfil del usuario");
      }
      return {
        success: true,
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

  async updateUserByEmail(
    token: string,
    userEmail: string,
    user: Partial<User>
  ): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const response = await fetch(
        apiEndpoints.users.UPDATE_USER_BY_EMAIL(userEmail),
        {
          method: "POST",
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
      const responseData = (await response.json()) as UserDto;
      return {
        success: true,
        user: userDtoToUser(responseData),
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

  async getQuantityByEmailAndProduct(
    token: string,
    userEmail: string,
    productId: string
  ): Promise<{ success: boolean; quantity?: number; message?: string }> {
    try {
      const response = await fetch(
        `${apiEndpoints.users.GET_ALL.replace(
          "getAllUsers",
          "getQuantity"
        )}/${userEmail}/${productId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al obtener la cantidad por producto");
      }
      const quantity = await response.json();
      return {
        success: true,
        quantity,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al obtener la cantidad por producto",
      };
    }
  }

  async editUserQuantity(
    token: string,
    payload: { email: string; quantity: number }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const url = `${apiEndpoints.users.GET_ALL.replace(
        "getAllUsers",
        "editQuantity"
      )}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Error al editar la cantidad de tokens del usuario");
      }
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al editar la cantidad de tokens",
      };
    }
  }

  async getUsedQuantityByEmail(
    token: string,
    userEmail: string
  ): Promise<{ success: boolean; used?: number; message?: string }> {
    try {
      const response = await fetch(
        `${apiEndpoints.users.GET_ALL.replace(
          "getAllUsers",
          "getUsedQuantity"
        )}/${userEmail}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al obtener la cantidad de tokens usados");
      }
      const used = await response.json(); // ← debería ser un número
      return {
        success: true,
        used,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al obtener tokens usados",
      };
    }
  }

  async getAllUserQuantities(token: string): Promise<{
    success: boolean;
    quantities?: Record<string, number>;
    message?: string;
  }> {
    try {
      const url = `${apiEndpoints.users.GET_ALL.replace(
        "getAllUsers",
        "getQuantity"
      )}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(
          "Error al obtener la cantidad de tokens de los usuarios"
        );
      }
      const data: Record<string, number> = await response.json();
      return {
        success: true,
        quantities: data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido al obtener la cantidad de tokens",
      };
    }
  }
}

export const userServiceReal = new UserServiceReal();
