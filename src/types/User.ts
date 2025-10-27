import { Role } from "./Role";

export type User = {
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  role: Role;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
};
