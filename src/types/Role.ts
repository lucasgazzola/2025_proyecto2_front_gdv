export const Role = {
  AUDITOR: "AUDITOR",
  USER: "USER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const isValidRole = (role: string): role is Role => {
  return Object.values(Role).includes(role as Role);
};
