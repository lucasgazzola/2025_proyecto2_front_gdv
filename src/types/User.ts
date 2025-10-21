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

// TODO: Ver cual es la mejor manera de hacerlo
// Interfaz que responde la api de los users
export type UserDto = {
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  role: Array<"ROLE_USER" | "ROLE_AUDITOR">;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
};

export function mapUserDtoRoleToRole(role: UserDto["role"]): Role {
  if (Array.isArray(role)) {
    if (role.includes("ROLE_AUDITOR")) return Role.AUDITOR;
    return Role.USER;
  }
  return Role.USER;
}

export const userDtoToUser = (userDto: UserDto): User => ({
  firstName: userDto.firstName,
  lastName: userDto.lastName,
  email: userDto.email,
  active: userDto.active,
  role: mapUserDtoRoleToRole(userDto.role),
  phone: userDto.phone,
  address: userDto.address,
  city: userDto.city,
  province: userDto.province,
});
