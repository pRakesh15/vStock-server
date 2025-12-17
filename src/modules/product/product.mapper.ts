import type { ERPNextCreateItemPayload } from "../../common/lib/erpnext.types";
import type{ CreateProductInput, EditProductInput } from "./product.types";

export const mapCreateProductToERP=(data: CreateProductInput):ERPNextCreateItemPayload => {
  return {
    item_code: data.item_code,
    item_name: data.name,
    description: data.description ?? "",
    item_group: data.item_group,
    image: data.image,
    custom_size: data.size,
    ...(data.colour && { custom_colour: data.colour }),
    custom_quantity: data.quantity,
    stock_uom: data.UOM,
    custom_warehouse: data.warehouse,
    custom_floor: data.floor,
    custom_rack_no: data.rack_no,
    ...(data.MRP && { custom_mrp: data.MRP }),
    ...(data.barcode && { custom_barcode: data.barcode }),
    ...(data.comment && { custom_comment: data.comment }),
  };
}

export function mapEditProductToERP(data: EditProductInput) {
  const payload: Record<string, any> = {};

  if (data.name !== undefined) payload.item_name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.item_group !== undefined) payload.item_group = data.item_group;
  if (data.image !== undefined) payload.image = data.image;
  if (data.size !== undefined) payload.custom_size = data.size;
  if (data.colour !== undefined) payload.custom_colour = data.colour;
  if (data.quantity !== undefined) payload.custom_quantity = data.quantity;
  if (data.UOM !== undefined) payload.stock_uom = data.UOM;
  if (data.warehouse !== undefined) payload.custom_warehouse = data.warehouse;
  if (data.floor !== undefined) payload.custom_floor = data.floor;
  if (data.rack_no !== undefined) payload.custom_rack_no = data.rack_no;
  if (data.MRP !== undefined) payload.custom_mrp = data.MRP;
  if (data.comment !== undefined) payload.custom_comment = data.comment;

  return payload;
}
