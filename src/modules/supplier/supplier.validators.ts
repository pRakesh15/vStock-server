import { z } from "zod";

export const createSupplierSchema = z.object({
  gstin: z.string().optional(),
  supplier_name: z.string().min(2),
  supplier_type: z.string().default("Company"),
  gst_category: z.string().default("Unregistered"),

  phone_no: z.string().optional(),

  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  mobile_no: z.string().optional(),

  pincode: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("India"),
});

export const editSupplierSchema = createSupplierSchema.partial();

export const getSuppliersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});
