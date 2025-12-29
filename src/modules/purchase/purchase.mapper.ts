import type { CreatePurchaseInput } from "./purchase.schema";

export const mapPurchaseToERP = (data: CreatePurchaseInput) => ({
  doctype: "Purchase Order", 
  supplier: data.supplier,
  transaction_date: data.transaction_date,
  schedule_date: data.schedule_date,
  company: data.company,

  items: data.items.map(item => ({
    item_code: item.item_code,
    qty: item.qty,
    rate: item.rate,
    warehouse: item.warehouse,
  })),
});
