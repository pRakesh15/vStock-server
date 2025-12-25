import { getERPClientForUser } from "../erp/erpConnection.service";

export class DashboardService {
    async getSummary(userId: string) {
        const erp = await getERPClientForUser(userId);

        const results = await Promise.allSettled([
            erp.getSalesInvoices({ limit: 100 }),
            erp.getPurchaseInvoices({ limit: 100 }),
            erp.getItems(),
        ]);

        const [salesResult, purchaseResult, itemsResult] = results;

        const salesData =
            salesResult.status === "fulfilled"
                ? salesResult.value.data ?? []
                : [];

        const purchaseData =
            purchaseResult.status === "fulfilled"
                ? purchaseResult.value.data ?? []
                : [];

        const itemsData =
            itemsResult.status === "fulfilled"
                ? itemsResult.value.data ?? []
                : [];

        const totalSales = salesData.reduce(
            (sum: number, s: any) => sum + (s.grand_total || 0),
            0
        );

        const totalPurchase = purchaseData.reduce(
            (sum: number, p: any) => sum + (p.grand_total || 0),
            0
        );

        const profit = totalSales - totalPurchase;

        const lowStockItems = itemsData.filter(
            (i: any) => i.actual_qty !== undefined && i.actual_qty < 15
        );

        return {
            totalSales,
            totalPurchase,
            profit,
            loss: profit < 0 ? Math.abs(profit) : 0,
            lowStockCount: lowStockItems.length,
            lowStockItems,
            errors: {
                sales: salesResult.status === "rejected" ? salesResult.reason : null,
                purchases: purchaseResult.status === "rejected" ? purchaseResult.reason : null,
                items: itemsResult.status === "rejected" ? itemsResult.reason : null,
            },
        };
    }
}

export const dashboardService = new DashboardService();
