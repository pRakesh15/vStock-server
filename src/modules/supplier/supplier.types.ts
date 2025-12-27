import { z } from "zod";
import {
  createSupplierSchema,
  editSupplierSchema,
  getSuppliersQuerySchema,
} from "./supplier.validators";

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type EditSupplierInput = z.infer<typeof editSupplierSchema>;
export type GetSuppliersQuery = z.infer<typeof getSuppliersQuerySchema>;
