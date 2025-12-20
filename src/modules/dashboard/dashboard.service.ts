import { getERPClientForUser } from "../erp/erpConnection.service";

export class DashboardService {
    async getSummary(userId: string) {
        const erp = await getERPClientForUser(userId);

        const [sales, purchases, items] = await Promise.all([
            erp.getSalesInvoices({ limit: 100 }),
            erp.getPurchaseInvoices({ limit: 100 }),
            erp.getItems(),
        ]);

        const totalSales = sales.data.reduce(
            (sum: any, s: any) => sum + (s.grand_total || 0),
            0
        );

        const totalPurchase = purchases.data.reduce(
            (sum: any, p: any) => sum + (p.grand_total || 0),
            0
        );

        const profit = totalSales - totalPurchase;
        const lowStockItems = items.data.filter(
            (i: any) => i.quantity !== undefined && i.quantity < 15
        );

        return {
            totalSales,
            totalPurchase,
            profit,
            loss: profit < 0 ? Math.abs(profit) : 0,
            lowStockCount: lowStockItems.length,
            lowStockItems,
        };
    }
}

export const dashboardService = new DashboardService();
