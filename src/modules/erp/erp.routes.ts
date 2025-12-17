import { Router } from "express";
import { testERPConnection } from "./erp.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/async-handler";

const erpRoutes = Router();

erpRoutes.get(
  "/test-connection",
  authenticate,
  asyncHandler(testERPConnection)
);

export default erpRoutes;
