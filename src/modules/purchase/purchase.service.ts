import { getERPClientForUser } from "../erp/erpConnection.service";
import { mapPurchaseToERP } from "./purchase.mapper";
import type { CreatePurchaseInput } from "./purchase.schema";

export class PurchaseService {
    async create(userId: string, data: CreatePurchaseInput) {
        const erpClient = await getERPClientForUser(userId);

        return erpClient.createPurchaseInvoice(
            mapPurchaseToERP(data)
        );
    }
    async getAll(userId: string) {
        const erpClient = await getERPClientForUser(userId);
        return erpClient.getPurchaseInvoices({ limit: 20 });
    }

    async getById(userId: string, id: string) {
        const erpClient = await getERPClientForUser(userId);
        return erpClient.getPurchaseInvoiceById(id);
    }
}

export const purchaseService = new PurchaseService();
