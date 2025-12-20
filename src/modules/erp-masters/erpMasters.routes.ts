import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/async-handler";
import { getERPMasters } from "./erpMasters.controller";

const erpMaterRouter = Router();

erpMaterRouter.get("/masters", authenticate, asyncHandler(getERPMasters));

export default erpMaterRouter;
