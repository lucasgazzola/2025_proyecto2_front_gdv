import type { LoginFormDto, LoginResponseDto } from "@/dto/LoginFormDto";
import type { RegisterFormDto } from "@/dto/RegisterFormDto";

export interface IAuthService {
  login(data: LoginFormDto): Promise<LoginResponseDto>;

  register(
    data: Omit<RegisterFormDto, "confirmPassword">
  ): Promise<{ success: boolean; message?: string }>;

  logout(token: string): Promise<{ success: boolean; message?: string }>;
  resetPassword(
    email: string,
    tokenPass: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string }>;

  changePassword(
    token: string,
    email: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string }>;

  forgotPassword(
    email: string
  ): Promise<{ success: boolean; message?: string }>;

  regenerateOtp(data: {
    token: string;
    email: string;
  }): Promise<{ success: boolean; message?: string }>;
}
