import jwt from "jsonwebtoken";
import type { JwtPayload } from "../common/Interfaces/auth.interface";
import { config } from "../config";

const JWT_SECRET = config.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = "55m";

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
