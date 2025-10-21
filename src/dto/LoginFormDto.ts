export type LoginFormDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  accessToken?: string;
  refreshToken?: string;
  success: boolean;
  message?: string;
};
