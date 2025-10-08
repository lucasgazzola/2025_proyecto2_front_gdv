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
  updateUserProfile(
    token: string,
    user: { email: string } & Partial<Omit<User, "email">>
  ): Promise<{ success: boolean; message?: string }>;
  updateUserByEmail(
    token: string,
    userEmail: string,
    user: Partial<User>
  ): Promise<{ success: boolean; message?: string; user?: User }>;
}
