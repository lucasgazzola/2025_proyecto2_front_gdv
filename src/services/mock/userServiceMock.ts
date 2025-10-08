import type { IUserService } from "@/services/interfaces/IUserService";
import { Role } from "@/types/Role";

class UserServiceMock implements IUserService {
  async getAllUsers() {
    return {
      success: true,
      message: "Mock getAllUsers",
      users: [
        {
          email: "mock@user.com",
          name: "Mock User",
          lastname: "MockLastname",
          active: true,
          role: Role.SUPERADMIN,
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
        role: Role.SUPERADMIN,
      },
    };
  }

  async getUserProfile() {
    return {
      success: true,
      message: "Mock getUserProfile",
      user: {
        email: "mock@user.com",
        name: "Mock User",
        lastname: "MockLastname",
        active: true,
        role: Role.SUPERADMIN,
      },
    };
  }

  async updateUserProfile() {
    return {
      success: true,
      message: "Mock updateUserProfile",
    };
  }

  async updateUserByEmail() {
    return {
      success: true,
      message: "Mock updateUserByEmail",
      user: {
        email: "mock@user.com",
        name: "Mock User",
        lastname: "MockLastname",
        active: true,
        role: Role.SUPERADMIN,
      },
    };
  }
}

export const userServiceMock = new UserServiceMock();
