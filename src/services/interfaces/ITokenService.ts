export interface ITokenService {
  validateToken(token: string): Promise<{ success: boolean; message?: string }>;
}
