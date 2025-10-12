import type { IUserService } from "@/services/interfaces/IUserService";
import { Role } from "@/types/Role";
import type { User } from "@/types/User";

export const USERS: User[] = [
  {
    email: "mock@user.com",
    name: "Mock User",
    lastname: "MockLastname",
    active: true,
    role: Role.AUDITOR,
    phone: "1234567890",
  },
  {
    email: "comun@user.com",
    name: "Comun User",
    lastname: "MockLastname",
    active: false,
    role: Role.USER,
    phone: "0987654321",
  },
];

class UserServiceMock implements IUserService {
  async getAllUsers(_token: string) {
    return {
      success: true,
      users: USERS,
    };
  }

  async getUserByEmail(_token: string, email: string) {
    const user = USERS.find((u) => u.email === email);
    if (user) {
      return Promise.resolve({ success: true, user });
    } else {
      return Promise.resolve({
        success: false,
        message: "Usuario no encontrado (mock)",
      });
    }
  }

  async getUserProfile(
    _token: string
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    return Promise.resolve({
      success: true,
      user: USERS[0],
    });
  }

  async updateUserByEmail(
    _token: string,
    userEmail: string,
    user: Partial<User>
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    const index = USERS.findIndex((u) => u.email === userEmail);
    if (index !== -1) {
      USERS[index] = { ...USERS[index], ...user };
      return Promise.resolve({ success: true, user: USERS[index] });
    } else {
      return Promise.resolve({
        success: false,
        message: "Usuario no encontrado (mock)",
      });
    }
  }
}

export const userServiceMock = new UserServiceMock();
