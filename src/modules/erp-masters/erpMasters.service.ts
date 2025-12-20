import { getERPClientForUser } from "../erp/erpConnection.service";

export class ERPMastersService {
    async getAll(userId: string) {
        const erp = await getERPClientForUser(userId);

        const [companies, warehouses, suppliers, customers] =
            await Promise.all([
                erp.getCompanies(),
                erp.getWarehouses(),
                erp.getSuppliers(),
                erp.getCustomers(),
            ]);

        return {
            companies,
            warehouses,
            suppliers,
            customers,
        };
    }
}

export const erpMastersService = new ERPMastersService();
