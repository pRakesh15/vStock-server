import { Router } from "express";
import { createPurchase, getPurchaseById, getPurchases } from "./purchase.controller";
import { asyncHandler } from "../../middleware/async-handler";
import { authenticate } from "../../middleware/auth.middleware";


const purchaseRoutes = Router();

purchaseRoutes.post(
    "/",
    authenticate,
    asyncHandler(createPurchase)
);

purchaseRoutes.get("/", authenticate, asyncHandler(getPurchases));
purchaseRoutes.get("/:id", authenticate, asyncHandler(getPurchaseById));


export default purchaseRoutes;
