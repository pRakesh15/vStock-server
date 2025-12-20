import { z } from "zod";

export const purchaseItemSchema = z.object({
    item_code: z.string(),
    qty: z.number().positive(),
    warehouse: z.string(),
    rate: z.number().positive().optional(),
});

export const createPurchaseSchema = z.object({
    supplier_name: z.string(),
    posting_date: z.string(), 
    company: z.string(),
    items: z.array(purchaseItemSchema).optional(),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
