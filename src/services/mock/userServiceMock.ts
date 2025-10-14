import type { IUserService } from "@/services/interfaces/IUserService";
import { Role } from "@/types/Role";
import type { User } from "@/types/User";

export type UserWithPassword = User & { password: string };

export const USERS: UserWithPassword[] = [
  {
    email: "auditor1@example.com",

    name: "John",
    lastname: "Doe",
    active: true,
    role: Role.AUDITOR,
    phone: "5551234567",
    password: "auditor1pass",
  },
  {
    email: "auditor2@example.com",
    name: "Jane",
    lastname: "Smith",
    active: true,
    role: Role.AUDITOR,
    phone: "5559876543",
    password: "auditor2pass",
  },
  {
    email: "user1@example.com",
    name: "Alice",
    lastname: "Johnson",
    active: false,
    role: Role.USER,
    phone: "5555678901",
    password: "user1pass",
  },
  {
    email: "user2@example.com",
    name: "Bob",
    lastname: "Brown",
    active: true,
    role: Role.USER,
    phone: "5556789012",
    password: "user2pass",
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
    try {
      const [email] = atob(_token).split(":");
      const user = USERS.find((u) => u.email === email);
      if (!user)
        return Promise.resolve({
          success: false,
          message: "Usuario no encontrado (mock)",
        });
      const { password, ...userWithoutPassword } = user;
      return Promise.resolve({ success: true, user: userWithoutPassword });
    } catch {
      return Promise.resolve({
        success: false,
        message: "Token inválido (mock)",
      });
    }
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
