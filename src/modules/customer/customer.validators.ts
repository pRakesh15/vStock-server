import { z } from "zod";

export const createCustomerSchema = z.object({
  gstin: z.string().optional(),
  customer_name: z.string().min(2),
  customer_type: z.literal("Company"),
  gst_category: z.string().default("Unregistered"),

  first_name: z.string(),
  last_name: z.string().optional(),
  email: z.string().email(),
  mobile_no: z.string(),

  address_line1: z.string(),
  address_line2: z.string().optional(),
  pincode: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string().default("India"),

  is_primary_address: z.boolean().default(true),
  is_shipping_address: z.boolean().default(true),
});

export const editCustomerSchema = createCustomerSchema.partial();
