import type { IAuthService } from "@/services/interfaces/IAuthService";
import type { LoginFormDto, LoginResponseDto } from "@/dto/LoginFormDto";
import type {
  RegisterFormDto,
  RegisterAdminFormDto,
} from "@/dto/RegisterFormDto";
import type { User } from "@/types/User";
import { Role } from "@/types/Role";

const mockUser: User = {
  email: "mock@user.com",
  name: "Mock User",
  lastname: "MockLastname",
  phone: "1234567890",
  active: true,
  role: Role.AUDITOR,
};

class AuthServiceMock implements IAuthService {
  async login(_data: LoginFormDto): Promise<LoginResponseDto> {
    return {
      success: true,
      message: "Mock login",
      accessToken: "mock-access-token",
      user: mockUser,
    };
  }
  async register(_data: RegisterFormDto) {
    return {
      success: true,
      message: "Mock register",
    };
  }
  async validateToken(token: string) {
    return {
      success: token === "mock-access-token",
      message: "Mock validateAccessToken",
    };
  }

  async logout(_token: string) {
    return {
      success: true,
      message: "Mock logout",
    };
  }
  async resetPassword(
    email: string,
    tokenPass: string,
    newPassword: string,
    confirmPassword: string
  ) {
    return {
      success: true,
      message: "Mock resetPassword",
    };
  }
  async registerAdmin(token: string, user: RegisterAdminFormDto) {
    return {
      success: true,
      user: mockUser,
      message: "Mock registerAdmin",
    };
  }
  async changePassword(
    token: string,
    email: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    return {
      success: true,
      message: "Mock changePassword",
    };
  }
  async forgotPassword(email: string) {
    return {
      success: true,
      message: "Mock forgotPassword",
    };
  }
  async regenerateOtp(data: { token: string; email: string }) {
    return {
      success: true,
      message: "Mock regenerateOtp",
    };
  }
  jwtDecode(token: string) {
    return { email: "mock@user.com", role: Role.AUDITOR };
  }
}

export const authServiceMock = new AuthServiceMock();
