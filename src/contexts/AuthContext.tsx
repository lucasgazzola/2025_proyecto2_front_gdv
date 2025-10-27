import type { LoginFormDto } from "@/dto/LoginFormDto";
import type { RegisterFormDto } from "@/dto/RegisterFormDto";
import { createContext } from "react";

interface AuthContextProps {
  name: string;
  lastname: string;
  email: string;
  role: string;
  isLoggedIn: boolean;
  authLoading: boolean;
  setName: (name: string) => void;
  setLastname: (lastname: string) => void;
  getAccessToken: () => string | null;
  register: (formData: RegisterFormDto) => Promise<void>;
  login: (formData: LoginFormDto) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | null>(null);
