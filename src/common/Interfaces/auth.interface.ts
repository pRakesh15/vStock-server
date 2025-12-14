export type UserRole = "admin" | "client";

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

