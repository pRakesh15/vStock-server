export interface ERPNextCreateItemPayload {
  item_code: string;
  item_name: string;
  description: string;
  item_group: string;
  image: string;

  custom_size: string;
  custom_quantity: number;
  stock_uom: string;
  custom_warehouse: string;
  custom_floor: string;
  custom_rack_no: string;

  custom_colour?: string;
  custom_mrp?: number;
  custom_barcode?: string;
  custom_comment?: string;
}


export interface EncryptedPayload {
  iv: string;
  content: string;
  tag: string;
}