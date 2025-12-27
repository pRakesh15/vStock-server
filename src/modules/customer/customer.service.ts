import { getERPClientForUser } from "../erp/erpConnection.service";
import {
    mapCreateCustomerToERP,
    mapEditCustomerToERP,
} from "./customer.mapper";
import type { CreateCustomerInput, EditCustomerInput } from "./customer.types";

class CustomerService {
    async create(userId: string, data: CreateCustomerInput) {
        const erp = await getERPClientForUser(userId);

        const customerPayload = mapCreateCustomerToERP(data);
        const customerResponse = await erp.createCustomer(customerPayload);

        const customerName = customerResponse.data?.name || data.customer_name;

        if (data.address_line1) {
            await erp.createAddress({
                address_title: customerName,
                address_type: "Billing",
                address_line1: data.address_line1,
                address_line2: data.address_line2 ?? "",
                pincode: data.pincode ?? "",
                city: data.city ?? "",
                state: data.state ?? "",
                country: data.country ?? "India",
                is_primary_address: 1,
                is_shipping_address: 1,
                links: [{
                    link_doctype: "Customer",
                    link_name: customerName,
                }],
            });
        }

        if (data.first_name || data.email || data.mobile_no) {
            await erp.createContact({
                first_name: data.first_name ?? "",
                last_name: data.last_name ?? "",
                email_id: data.email ?? "",
                mobile_no: data.mobile_no ?? "",
                is_primary_contact: 1,
                links: [{
                    link_doctype: "Customer",
                    link_name: customerName,
                }],
            });
        }

        return customerResponse;
    }



    async update(userId: string, id: string, data: EditCustomerInput) {
        const erp = await getERPClientForUser(userId);

        const customerPayload = mapEditCustomerToERP(data);
        const customerResponse = await erp.updateCustomer(id, customerPayload);

        if (data.address_line1) {
            try {
                const addresses = await erp.getAddressesByEntity("Customer", id);

                if (addresses.data && addresses.data.length > 0) {
                    const primaryAddress = addresses.data[0];
                    await erp.updateAddress(primaryAddress.name, {
                        address_line1: data.address_line1,
                        address_line2: data.address_line2 || "",
                        pincode: data.pincode || "",
                        city: data.city || "",
                        state: data.state || "",
                        country: data.country || "India",
                    });
                } else {
                    await erp.createAddress({
                        address_title: id,
                        address_type: "Billing",
                        address_line1: data.address_line1,
                        address_line2: data.address_line2 || "",
                        pincode: data.pincode || "",
                        city: data.city || "",
                        state: data.state || "",
                        country: data.country || "India",
                        is_primary_address: 1,
                        is_shipping_address: 1,
                        links: [
                            {
                                link_doctype: "Customer",
                                link_name: id,
                            },
                        ],
                    });
                }
            } catch (addressError) {
                console.error("Failed to update address for customer:", {
                    customer: id,
                    error: addressError,
                });
            }
        }

        return customerResponse;
    }

    async delete(userId: string, id: string) {
        const erp = await getERPClientForUser(userId);
        return erp.deleteCustomer(id);
    }

    async getById(userId: string, id: string) {
        const erp = await getERPClientForUser(userId);
        const customer = await erp.getCustomerById(id);

        try {
            const addresses = await erp.getAddressesByEntity("Customer", id);
            if (customer.data && addresses.data) {
                customer.data.addresses = addresses.data;
            }
        } catch (error) {
            console.error("Failed to fetch customer addresses:", error);
        }

        return customer;
    }

    async list(userId: string) {
        const erp = await getERPClientForUser(userId);
        return erp.getCustomers();
    }
}

export const customerService = new CustomerService();