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

const customerRouter = Router();

customerRouter.post("/", authenticate, asyncHandler(createCustomer));
customerRouter.get("/", authenticate, asyncHandler(getCustomers));
customerRouter.get("/:id", authenticate, asyncHandler(getCustomerById));
customerRouter.put("/:id", authenticate, asyncHandler(updateCustomer));
customerRouter.delete("/:id", authenticate, asyncHandler(deleteCustomer));

export default customerRouter;
