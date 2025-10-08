import { Role } from "./Role";

export type User = {
  email: string;
  name: string;
  lastname: string;
  active: boolean;
  role: Role;
};

// TODO: Ver cual es la mejor manera de hacerlo
// Interfaz que responde la api de los users
export type UserDto = {
  email: string;
  name: string;
  lastname: string;
  active: boolean;
  role: Array<"ROLE_USER" | "ROLE_SUPERADMIN">;
};

export function mapUserDtoRoleToRole(role: UserDto["role"]): Role {
  if (Array.isArray(role)) {
    if (role.includes("ROLE_SUPERADMIN")) return Role.SUPERADMIN;
    return Role.USER;
  }
  return Role.USER;
}

export const userDtoToUser = (userDto: UserDto): User => ({
  name: userDto.name,
  lastname: userDto.lastname,
  email: userDto.email,
  active: userDto.active,
  role: mapUserDtoRoleToRole(userDto.role),
});
