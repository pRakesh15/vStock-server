import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../common/Interfaces/auth.interface";

export const requireRole =
    (...roles: UserRole[]) =>
        (req: Request, res: Response, next: NextFunction) => {
            if (!req.user || !roles.includes(req.user.role)) {
                return res.status(403).json({
                    message: "Forbidden: Insufficient permissions",
                });
            }
            next();
        };
