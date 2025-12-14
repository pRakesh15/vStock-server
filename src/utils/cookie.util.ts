import type{ Response } from "express";
import { config } from "../config";

const COOKIE_NAME = "access_token";

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 56 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}
