import { getERPClientForUser } from "../erp/erpConnection.service";
import { mapPurchaseToERP } from "./purchase.mapper";
import type { CreatePurchaseInput } from "./purchase.schema";

export class PurchaseService {
  async create(userId: string, data: CreatePurchaseInput) {
    const erpClient = await getERPClientForUser(userId);

    console.log("Purchase Order API payload:", data);
    console.log("Purchase Order ERP payload:", mapPurchaseToERP(data));

    return erpClient.createPurchaseOrder(
      mapPurchaseToERP(data)
    );
  }

  async getAll(userId: string) {
    const erpClient = await getERPClientForUser(userId);
    return erpClient.getPurchaseOrders({ limit: 20 });
  }

  async getById(userId: string, id: string) {
    const erpClient = await getERPClientForUser(userId);
    return erpClient.getPurchaseOrderById(id);
  }
}

export const purchaseService = new PurchaseService();
