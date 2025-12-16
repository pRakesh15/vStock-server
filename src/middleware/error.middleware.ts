import type { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const requestId = (req as any).id;

  logger.error(
    {
      error: err.message || err,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      requestId,
    },
    "Unhandled error occurred"
  );

  const status = err.status || err.statusCode || 500;

  const response = {
    message:
      status >= 500
        ? "Internal server error"
        : err.message || "Something went wrong",
    requestId,
  };

  return res.status(status).json(response);
}
