import { z } from "zod";

export const createProductSchema = z.object({
  item_code: z.string().max(140),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  item_group: z.string(),
  image: z.string().url(),
  size: z.string(),
  colour: z.string().optional(),
  quantity: z.number().int().min(0),
  UOM: z.string(),
  warehouse: z.string(),
  floor: z.string(),
  rack_no: z.string(),
  MRP: z.number().optional(),
  barcode: z.string().optional(),
  comment: z.string().optional(),
});

export const editProductSchema = createProductSchema.partial();

export const getProductsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});
