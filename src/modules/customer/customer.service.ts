import { getERPClientForUser } from "../erp/erpConnection.service";
import {
  mapCreateCustomerToERP,
  mapEditCustomerToERP,
} from "./customer.mapper";
import type { CreateCustomerInput, EditCustomerInput } from "./customer.types";

class CustomerService {
  async create(userId: string, data: CreateCustomerInput) {
    const erp = await getERPClientForUser(userId);
    return erp.createCustomer(mapCreateCustomerToERP(data));
  }

  async update(userId: string, id: string, data: EditCustomerInput) {
    const erp = await getERPClientForUser(userId);
    return erp.updateCustomer(id, mapEditCustomerToERP(data));
  }

  async delete(userId: string, id: string) {
    const erp = await getERPClientForUser(userId);
    return erp.deleteCustomer(id);
  }

  async getById(userId: string, id: string) {
    const erp = await getERPClientForUser(userId);
    return erp.getCustomerById(id);
  }

  async list(userId: string) {
    const erp = await getERPClientForUser(userId);
    return erp.getCustomers();
  }
}

export const customerService = new CustomerService();
