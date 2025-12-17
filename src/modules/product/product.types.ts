import { z } from "zod";
import {
  createProductSchema,
  editProductSchema,
  getProductsQuerySchema,
} from "./product.validators";

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type EditProductInput = z.infer<typeof editProductSchema>;
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
