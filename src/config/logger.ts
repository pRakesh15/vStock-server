// src/config/logger.ts
import pino from "pino";
import pinoHttp from "pino-http";
import { config } from "./index"; // use   for runtime
import type { RequestHandler } from "express";


function createLogger() {
  const level = config.LOG_LEVEL || "info";

  if (config.NODE_ENV === "development") {
    try {
      const transport = pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          singleLine: false,
          ignore: "pid,hostname",
        },
      });

      return pino({ level }, transport);
    } catch (err) {
      console.warn("pino-pretty unavailable, falling back to JSON logger:", (err as Error)?.message ?? err);
      return pino({ level });
    }
  }

  return pino({ level });
}

export const logger = createLogger();

export const pinoMiddleware: RequestHandler = (pinoHttp as unknown as any)({
  logger,
  customLogLevel: (req: any, res: any, err: Error | null) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});

export default logger;
