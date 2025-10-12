import type { IUserService } from "@/services/interfaces/IUserService";
import { Role } from "@/types/Role";

class UserServiceMock implements IUserService {
  async getAllUsers(_token: string) {
    return {
      success: true,
      message: "Mock getAllUsers",
      users: [
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
      ],
    };
  }

  async getUserByEmail(_token: string, email: string) {
    return {
      success: true,
      message: "Mock getUserByEmail",
      user: {
        email,
        name: "Mock User",
        lastname: "MockLastname",
        active: true,
        role: Role.AUDITOR,
        phone: "1234567890",
      },
    };
  }

  async getUserProfile(_token: string) {
    return {
      success: true,
      message: "Mock getUserProfile",
      user: {
        email: "mock@user.com",
        name: "Mock User",
        lastname: "MockLastname",
        active: true,
        role: Role.AUDITOR,
        phone: "1234567890",
      },
    };
  }

  async updateUserProfile(
    _token: string,
    _user: { email: string } & Partial<Omit<import("@/types/User").User, "email">>
  ) {
    return {
      success: true,
      message: "Mock updateUserProfile",
    };
  }

  async updateUserByEmail(
    _token: string,
    _userEmail: string,
    _user: Partial<import("@/types/User").User>
  ) {
    return {
      success: true,
      message: "Mock updateUserByEmail",
      user: {
        email: _userEmail,
        name: (_user.name as string) ?? "Mock User",
        lastname: (_user.lastname as string) ?? "MockLastname",
        active: typeof _user.active === "boolean" ? _user.active : true,
  role: ((_user as unknown) as { role?: import("@/types/Role").Role }).role ?? Role.AUDITOR,
  phone: ((_user as unknown) as { phone?: string }).phone ?? "1234567890",
      },
    };
  }
}

export const userServiceMock = new UserServiceMock();
