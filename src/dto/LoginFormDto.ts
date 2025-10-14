export type LoginFormDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  accessToken?: string;
  success: boolean;
  message?: string;
};
