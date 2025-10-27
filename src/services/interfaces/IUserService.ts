import type { User } from "@/types/User";

export interface IUserService {
  getAllUsers(
    token: string
  ): Promise<{ success: boolean; message?: string; users?: User[] }>;
  getUserByEmail(
    token: string,
    email: string
  ): Promise<{ success: boolean; message?: string; user?: User }>;
  getUserProfile(
    token: string
  ): Promise<{ success: boolean; message?: string; user?: User }>;
  updateUserByEmail(
    token: string,
    userEmail: string,
    user: Partial<User>
  ): Promise<{ success: boolean; message?: string; user?: User }>;
  changePassword(
    token: string,
    email: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string }>;
  updateUserProfile(
    token: string,
    user: Partial<User>
  ): Promise<{ success: boolean; message?: string; user?: User }>;
}
