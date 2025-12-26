import type { CreateCustomerInput, EditCustomerInput } from "./customer.types";

export const mapCreateCustomerToERP = (data: CreateCustomerInput) => ({
  customer_name: data.customer_name,
  customer_type: data.customer_type,
  gst_category: data.gst_category,
  gstin: data.gstin,

  customer_primary_contact: {
    first_name: data.first_name,
    last_name: data.last_name,
    email_id: data.email,
    mobile_no: data.mobile_no,
  },

  customer_primary_address: {
    address_line1: data.address_line1,
    address_line2: data.address_line2,
    pincode: data.pincode,
    city: data.city,
    state: data.state,
    country: data.country,
    is_primary_address: data.is_primary_address,
    is_shipping_address: data.is_shipping_address,
  },
});

export const mapEditCustomerToERP = (data: EditCustomerInput) => ({
  ...(data.customer_name && { customer_name: data.customer_name }),
  ...(data.gstin && { gstin: data.gstin }),
  ...(data.gst_category && { gst_category: data.gst_category }),
});
