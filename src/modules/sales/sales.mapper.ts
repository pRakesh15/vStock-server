import type { CreateSalesInput } from "./sales.schema";

export const mapSalesToERP = (data: CreateSalesInput) => ({
    customer: data.customer_name,
    posting_date: data.posting_date,
    company: data.company,
    update_stock: 1,
    items: data.items?.map(item => ({
        item_code: item.item_code,
        qty: item.qty,
        ...(item.rate !== undefined && { rate: item.rate }),
        warehouse: item.warehouse,
    })) ?? [],

});
