import { z } from "zod";

export const purchaseItemSchema = z.object({
  item_code: z.string().min(1),
  qty: z.number().positive(),
  rate: z.number().positive(),
  warehouse: z.string().min(1),
});

export const createPurchaseSchema = z.object({
  supplier: z.string().min(1),
  transaction_date: z.string().min(1), // PO date
  schedule_date: z.string().min(1),    // REQUIRED for PO
  company: z.string().min(1),
  items: z.array(purchaseItemSchema).min(1),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
