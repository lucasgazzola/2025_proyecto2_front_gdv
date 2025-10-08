import type { User } from "@/types/User";

export type LoginFormDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  accessToken?: string;
  success: boolean;
  message?: string;
  user?: User;
};
