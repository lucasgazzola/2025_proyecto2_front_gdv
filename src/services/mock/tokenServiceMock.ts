import type { ITokenService } from "../interfaces/ITokenService";
import { USERS } from "./userServiceMock";

class TokenServiceMock implements ITokenService {
  async validateToken(
    token: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const [email] = atob(token).split(":");
      const user = USERS.find((u) => u.email === email);
      if (!user) {
        return Promise.resolve({
          success: false,
          message: "Token inválido",
        });
      }
      return Promise.resolve({ success: true });
    } catch (error) {
      return Promise.resolve({
        success: false,
        message: "Token inválido",
      });
    }
  }
}

export const tokenServiceMock = new TokenServiceMock();
