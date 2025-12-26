import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/async-handler";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
} from "./customer.controller";

const router = Router();

router.post("/", authenticate, asyncHandler(createCustomer));
router.get("/", authenticate, asyncHandler(getCustomers));
router.get("/:id", authenticate, asyncHandler(getCustomerById));
router.put("/:id", authenticate, asyncHandler(updateCustomer));
router.delete("/:id", authenticate, asyncHandler(deleteCustomer));

export default router;
