import type { CreatePurchaseInput } from "./purchase.schema";

export const mapPurchaseToERP = (data: CreatePurchaseInput) => ({
    supplier: data.supplier_name,
    posting_date: data.posting_date,
    company: data.company,
    update_stock: 1,
    items: data.items?.map(item => ({
        item_code: item.item_code,
        qty: item.qty,
        accepted_warehouse: item.warehouse,
        ...(item.rate !== undefined && { rate: item.rate }),
    })) ?? [],
});
