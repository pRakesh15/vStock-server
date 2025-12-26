import { z } from "zod";
import {
  createCustomerSchema,
  editCustomerSchema,
} from "./customer.validators";

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type EditCustomerInput = z.infer<typeof editCustomerSchema>;
