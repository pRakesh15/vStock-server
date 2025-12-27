import type { CreateCustomerInput, EditCustomerInput } from "./customer.types";

export const mapCreateCustomerToERP = (data: CreateCustomerInput) => ({
  customer_name: data.customer_name,
  customer_type: data.customer_type,
  gst_category: data.gst_category ?? "Unregistered",
  ...(data.gstin && { gstin: data.gstin }),
});

export const mapEditCustomerToERP = (data: EditCustomerInput) => ({
  ...(data.customer_name && { customer_name: data.customer_name }),
  ...(data.gstin && { gstin: data.gstin }),
  ...(data.gst_category && { gst_category: data.gst_category }),
});
