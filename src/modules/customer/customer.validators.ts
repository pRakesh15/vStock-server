import { z } from "zod";

export const createCustomerSchema = z.object({
  gstin: z.string().optional(),

  customer_name: z.string().min(2),
  customer_type: z.literal("Company"),
  gst_category: z.string().default("Unregistered"),

  // Contact (optional)
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  mobile_no: z.string().optional(),

  // Address (optional)
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  pincode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("India"),

  // UI flags (not sent to ERP directly)
  is_primary_address: z.boolean().optional().default(true),
  is_shipping_address: z.boolean().optional().default(true),
});

export const editCustomerSchema = createCustomerSchema.partial();
