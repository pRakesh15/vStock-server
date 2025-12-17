import { Router } from "express";
import {
  createProduct,
  editProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getPublicProductByBarcode,
} from "./product.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/async-handler";

const productRoutes = Router();

productRoutes.post("/", authenticate, asyncHandler(createProduct));
productRoutes.put("/:id", authenticate, asyncHandler(editProduct));
productRoutes.delete("/:id", authenticate, asyncHandler(deleteProduct));
productRoutes.get("/:id", authenticate, asyncHandler(getProductById));
productRoutes.get("/", authenticate, asyncHandler(getProducts));

productRoutes.get(
  "/public/:tenantId/products/:barcode",
  asyncHandler(getPublicProductByBarcode)
);

export default productRoutes;
