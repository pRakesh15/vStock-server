import express from "express";
import type { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { config } from "./config/index";
import { pinoMiddleware } from "./config/logger";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();



const app = express();

app.use(pinoMiddleware);

app.use(helmet());

app.use(
    cors({
        origin: config.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(compression());

app.use(requestIdMiddleware);  //by this we don't need to right  all the (req,res and next) in all of the controller function .

app.use(express.json({ limit: config.REQUEST_BODY_LIMIT || "900kb" }));
app.use(express.urlencoded({ extended: true, limit: "900kb" }));

const apiLimiter = rateLimit({
    windowMs: Number(config.RATE_LIMIT_WINDOW_MS) || 60_000,
    max: Number(config.RATE_LIMIT_MAX) || 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
        return res.status(429).json({ message: "Too many requests, please try again later." });
    },
});

app.use("/api/v1", apiLimiter);

//here i add all the routs 

app.get("/health", (_req: Request, res: Response) => res.status(200).json({ status: "ok" }));
app.get("/ready", (_req: Request, res: Response) => {
    res.status(200).json({ ready: true });
});

app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Not Found" });
});

app.use(errorHandler);

export default app;
