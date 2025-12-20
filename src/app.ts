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
import cookieParser from "cookie-parser";
import userRoutes from "./modules/user/user.route";
import erpRoutes from "./modules/erp/erp.routes";
import productRoutes from "./modules/product/product.routes";
import imageUploadrouter from "./modules/image-upload/imageUpload.routes";
import salesRoutes from "./modules/sales/sales.routes";
import purchaseRoutes from "./modules/purchase/purchase.routes";
import dashBoardRouter from "./modules/dashboard/dashboard.routes";
import erpMaterRouter from "./modules/erp-masters/erpMasters.routes";

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

app.use(requestIdMiddleware);  //helps for debuging distributed systems.
app.use(express.json({ limit: config.REQUEST_BODY_LIMIT || "5000kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "5000kb" }));

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
//User Routs
app.use("/api/v1/users", userRoutes);
//Erp Connection Routs
app.use("/api/erp", erpRoutes);
//image upload
app.use("/api/imageUpload", imageUploadrouter);
//Product Routs
app.use("/api/v1/product", productRoutes);
//shell rout
app.use("/api/v1/sales", salesRoutes);
//purchase rout
app.use("/api/v1/purchases", purchaseRoutes);
//dashboard rout
app.use("/api/v1/dashboard", dashBoardRouter);
//erpmasterRout
app.use("/api/v1/erpmaster", erpMaterRouter);





app.get("/health", (_req: Request, res: Response) => res.status(200).json({ status: "ok" }));
app.get("/ready", (_req: Request, res: Response) => {
    res.status(200).json({ ready: true });
});

app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Not Found" });
});

app.use(errorHandler);

export default app;
