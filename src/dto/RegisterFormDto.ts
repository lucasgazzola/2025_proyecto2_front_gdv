export interface RegisterFormDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export interface RegisterAdminFormDto extends RegisterFormDto {
  roles: string[];
}
