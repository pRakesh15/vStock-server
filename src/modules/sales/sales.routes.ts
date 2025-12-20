import { Router } from "express";
import { createSale, getSaleById, getSales } from "./sales.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/async-handler";


const salesRoutes = Router();

salesRoutes.post(
    "/",
    authenticate,
    asyncHandler(createSale)
);

salesRoutes.get("/", authenticate, asyncHandler(getSales));
salesRoutes.get("/:id", authenticate, asyncHandler(getSaleById));


export default salesRoutes;
