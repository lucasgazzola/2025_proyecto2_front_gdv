import { apiEndpoints } from "@/api/endpoints";
import type { ITokenService } from "./interfaces/ITokenService";

class TokenServiceReal implements ITokenService {
  async validateToken(
    token: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.auth.VALIDATE_TOKEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Token inválido",
        };
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: "Error al conectar con el servidor",
      };
    }
  }
}

export const tokenServiceReal = new TokenServiceReal();
