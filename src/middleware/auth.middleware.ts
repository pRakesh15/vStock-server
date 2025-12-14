import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired session" });
    }
}
