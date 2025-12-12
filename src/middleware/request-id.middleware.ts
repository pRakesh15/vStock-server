import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export function requestIdMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const id = randomUUID();
  (req as any).id = id;
  next();
}
