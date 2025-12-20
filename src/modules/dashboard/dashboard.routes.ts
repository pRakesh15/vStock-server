import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/async-handler";
import { getDashboardSummary } from "./dashboard.controller";

const dashBoardRouter = Router();

dashBoardRouter.get("/summary", authenticate, asyncHandler(getDashboardSummary));

export default dashBoardRouter;
