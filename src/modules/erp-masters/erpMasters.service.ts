import { getERPClientForUser } from "../erp/erpConnection.service";

export class ERPMastersService {
  async getAll(userId: string) {
    const erp = await getERPClientForUser(userId);

    const results = await Promise.allSettled([
      erp.getCompanies(),
      erp.getWarehouses(),
      erp.getSuppliers(),
      erp.getCustomers(),
    ]);

    const [companiesRes, warehousesRes, suppliersRes, customersRes] = results;

    return {
      companies:
        companiesRes.status === "fulfilled" ? companiesRes.value : [],
      warehouses:
        warehousesRes.status === "fulfilled" ? warehousesRes.value : [],
      suppliers:
        suppliersRes.status === "fulfilled" ? suppliersRes.value : [],
      customers:
        customersRes.status === "fulfilled" ? customersRes.value : [],
      errors: {
        companies:
          companiesRes.status === "rejected" ? companiesRes.reason : null,
        warehouses:
          warehousesRes.status === "rejected" ? warehousesRes.reason : null,
        suppliers:
          suppliersRes.status === "rejected" ? suppliersRes.reason : null,
        customers:
          customersRes.status === "rejected" ? customersRes.reason : null,
      },
    };
  }
}

export const erpMastersService = new ERPMastersService();
