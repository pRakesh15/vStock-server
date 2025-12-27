import { getERPClientForUser } from "../erp/erpConnection.service";
import {
  mapCreateSupplierToERP,
  mapEditSupplierToERP,
} from "./supplier.mapper";
import type { CreateSupplierInput, EditSupplierInput, GetSuppliersQuery } from "./supplier.types";

class SupplierService {
  async create(userId: string, data: CreateSupplierInput) {
    const erp = await getERPClientForUser(userId);

    const supplierPayload = mapCreateSupplierToERP(data);
    const supplierResponse = await erp.createSupplier(supplierPayload);

    const supplierName = supplierResponse.data?.name || data.supplier_name;

    if (data.address_line1) {
      try {
        await erp.createAddress({
          address_title: data.supplier_name,
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
              link_doctype: "Supplier",
              link_name: supplierName,
            },
          ],
        });
      } catch (addressError) {
        console.error("Failed to create address for supplier:", {
          supplier: supplierName,
          error: addressError,
        });
      }
    }

    if (data.first_name || data.email || data.mobile_no) {
      try {
        await erp.createContact({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email_id: data.email || "",
          mobile_no: data.mobile_no || "",
          is_primary_contact: 1,
          links: [
            {
              link_doctype: "Supplier",
              link_name: supplierName,
            },
          ],
        });
      } catch (contactError) {
        console.error("Failed to create contact for supplier:", {
          supplier: supplierName,
          error: contactError,
        });
      }
    }

    return supplierResponse;
  }

  async update(userId: string, supplierId: string, data: EditSupplierInput) {
    const erp = await getERPClientForUser(userId);

    // Update supplier basic info
    const supplierPayload = mapEditSupplierToERP(data);
    const supplierResponse = await erp.updateSupplier(supplierId, supplierPayload);

    // If address fields are present, update or create address
    if (data.address_line1) {
      try {
        // Get existing addresses
        const addresses = await erp.getAddressesByEntity("Supplier", supplierId);
        
        if (addresses.data && addresses.data.length > 0) {
          // Update the first (primary) address
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
          // Create new address if none exists
          await erp.createAddress({
            address_title: supplierId,
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
                link_doctype: "Supplier",
                link_name: supplierId,
              },
            ],
          });
        }
      } catch (addressError) {
        console.error("Failed to update address for supplier:", {
          supplier: supplierId,
          error: addressError,
        });
      }
    }

    return supplierResponse;
  }

  async delete(userId: string, supplierId: string) {
    const erp = await getERPClientForUser(userId);
    return erp.deleteSupplier(supplierId);
  }

  async getById(userId: string, supplierId: string) {
    const erp = await getERPClientForUser(userId);
    const supplier = await erp.getSupplierById(supplierId);

    try {
      const addresses = await erp.getAddressesByEntity("Supplier", supplierId);
      if (supplier.data && addresses.data) {
        supplier.data.addresses = addresses.data;
      }
    } catch (error) {
      console.error("Failed to fetch supplier addresses:", error);
    }

    return supplier;
  }

  async list(userId: string, query: GetSuppliersQuery) {
    const erp = await getERPClientForUser(userId);


    
    return erp.getSuppliers();
  }
}

export const supplierService = new SupplierService();
