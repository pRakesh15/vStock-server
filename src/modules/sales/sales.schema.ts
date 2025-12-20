import { z } from "zod";

export const salesItemSchema = z.object({
  item_code: z.string().min(1),
  qty: z.number().positive(),
  rate: z.number().positive().optional(),
  warehouse: z.string().min(1), 
});

export const createSalesSchema = z.object({
  customer_name: z.string().min(1),
  posting_date: z.string(), 
  company: z.string().min(1), 
  items: z.array(salesItemSchema).min(1),
});

export type CreateSalesInput = z.infer<typeof createSalesSchema>;
