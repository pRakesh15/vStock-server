import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/async-handler";
import {
  createSupplier,
  editSupplier,
  deleteSupplier,
  getSupplierById,
  getSuppliers,
} from "./supplier.controller";

const supplierRouter = Router();

supplierRouter.post("/", authenticate, asyncHandler(createSupplier));
supplierRouter.put("/:id", authenticate, asyncHandler(editSupplier));
supplierRouter.delete("/:id", authenticate, asyncHandler(deleteSupplier));
supplierRouter.get("/:id", authenticate, asyncHandler(getSupplierById));
supplierRouter.get("/", authenticate, asyncHandler(getSuppliers));

export default supplierRouter;
