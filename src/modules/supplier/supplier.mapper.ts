// supplier.mapper.ts
import type { CreateSupplierInput, EditSupplierInput } from "./supplier.types";

export function mapCreateSupplierToERP(data: CreateSupplierInput) {
  return {
    supplier_name: data.supplier_name,
    supplier_type: data.supplier_type ?? "Company",
    gst_category: data.gst_category ?? "Unregistered",
    ...(data.gstin && { gstin: data.gstin }),
    ...(data.phone_no && { custom_phone_no: data.phone_no }),
  };
}

export function mapEditSupplierToERP(data: EditSupplierInput) {
  const payload: Record<string, any> = {};

  if (data.supplier_name) payload.supplier_name = data.supplier_name;
  if (data.gstin) payload.gstin = data.gstin;
  if (data.gst_category) payload.gst_category = data.gst_category;
  if (data.phone_no) payload.custom_phone_no = data.phone_no;

  return payload;
}
