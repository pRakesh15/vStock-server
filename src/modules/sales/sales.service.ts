import { AppError } from "../../common/error/app-error";
import { getERPClientForUser } from "../erp/erpConnection.service";
import { mapSalesToERP } from "./sales.mapper";
import type { CreateSalesInput } from "./sales.schema";

export class SalesService {
    async create(userId: string, data: CreateSalesInput) {
        const erpClient = await getERPClientForUser(userId);
        // if (data.items?.length) {
        //     for (const item of data.items) {
        //         const availableQty = await erpClient.getItemStock(item.item_code);

        //         if (availableQty < item.qty) {
        //             throw new AppError(
        //                 `Insufficient stock for item ${item.item_code}. Available: ${availableQty}`,
        //                 400
        //             );
        //         }
        //     }
        // }
        return erpClient.createSalesInvoice(
            mapSalesToERP(data)
        );
    }
    async getAll(userId: string) {
        const erpClient = await getERPClientForUser(userId);
        return erpClient.getSalesInvoices({ limit: 20 });
    }

    async getById(userId: string, id: string) {
        const erpClient = await getERPClientForUser(userId);
        return erpClient.getSalesInvoiceById(id);
    }
}

export const salesService = new SalesService();
