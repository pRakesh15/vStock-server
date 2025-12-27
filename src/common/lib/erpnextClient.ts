import { decrypt } from "../../utils/crypto.util";
import parseERPNextErrorMessage from "../../utils/parseERPNextErrorMessage.util";
import { getERPItemFieldNames, mapERPItemToProduct } from "../../utils/productFieldMap.util";
import { AppError } from "../error/app-error";
import { parseEncryptedPayload } from "./crypto.util";
import type { ERPNextCreateItemPayload, ERPNextPurchaseInvoicePayload, ERPNextSalesInvoicePayload } from "./erpnext.types";

export interface ERPNextCredentials {
    erpDomain: string;
    apiKey: string;
    apiSecret: string;
}

export interface ERPNextEncryptedCredentials {
    erpDomain: string;
    encryptedApiKey: string;
    encryptedApiSecret: string;
}

export interface ERPNextItemPayload {
    item_code: string;
    item_name: string;
    description?: string;
    item_group: string;
    image: string;
    size: string;
    colour?: string;
    quantity: number;
    UOM: string;
    warehouse: string;
    floor: string;
    rack_no: string;
    MRP?: number;
    barcode: string;
    comment?: string;
}

export interface ERPNextResponse<T = any> {
    data: T;
    message?: string;
}

export class ERPNextClient {
    private credentials: ERPNextCredentials;

    constructor(credentials: ERPNextCredentials) {
        this.credentials = credentials;
    }

    private getHeaders(): HeadersInit {
        const token = `${this.credentials.apiKey}:${this.credentials.apiSecret}`;
        return {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
        };
    }

    private getApiUrl(endpoint: string): string {
        let baseUrl = this.credentials.erpDomain.endsWith("/")
            ? this.credentials.erpDomain.slice(0, -1)
            : this.credentials.erpDomain;

        if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
            baseUrl = `https://${baseUrl}`;
        }

        return `${baseUrl}/api/resource/${endpoint}`;
    }

    private getMethodUrl(method: string): string {
        let baseUrl = this.credentials.erpDomain.endsWith("/")
            ? this.credentials.erpDomain.slice(0, -1)
            : this.credentials.erpDomain;

        if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
            baseUrl = `https://${baseUrl}`;
        }

        return `${baseUrl}/api/method/${method}`;
    }

    async createItem(payload: ERPNextCreateItemPayload): Promise<ERPNextResponse> {
        const url = this.getApiUrl("Item");

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data._server_messages,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    "Failed to create item in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async updateItem(itemCode: string, payload: Record<string, any>): Promise<ERPNextResponse> {
        const url = this.getApiUrl(`Item/${itemCode}`);

        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data._server_messages,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    "Failed to update item in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });
            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async getItems(filters?: Record<string, any>): Promise<ERPNextResponse> {
        let url = this.getApiUrl("Item");
        const searchParams = new URLSearchParams();

        searchParams.append("fields", JSON.stringify(getERPItemFieldNames()));

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    const isCustom = [
                        "size",
                        "colour",
                        "quantity",
                        "UOM",
                        "warehouse",
                        "floor",
                        "rack_no",
                        "MRP",
                        "barcode",
                        "comment",
                    ].includes(key);

                    const erpField = isCustom ? `custom_${key.toLowerCase()}` : key;
                    searchParams.append(erpField, String(value));
                }
            });
        }

        if (searchParams.toString()) {
            url += `?${searchParams.toString()}`;
        }

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: this.getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    data.message || data.exc || "Failed to fetch items from ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            if (Array.isArray(data.data)) {
                data.data = data.data.map(mapERPItemToProduct);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async deleteItem(itemCode: string): Promise<ERPNextResponse> {
        const url = this.getApiUrl(`Item/${itemCode}`);

        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: this.getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    data.message || data.exc || "Failed to delete item in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async createPurchaseInvoice(
        payload: ERPNextPurchaseInvoicePayload
    ): Promise<ERPNextResponse> {
        const url = this.getApiUrl("Purchase Invoice");

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext Purchase Invoice Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data._server_messages,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    "Failed to create purchase invoice"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;

            console.error("ERPNext Client Error (Purchase Invoice):", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async getPurchaseInvoices(params?: {
        limit?: number;
        offset?: number;
    }) {
        const url = new URL(this.getApiUrl("Purchase Invoice"));

        url.searchParams.set("fields", JSON.stringify([
            "name",
            "supplier",
            "posting_date",
            "grand_total",
            "status"
        ]));

        if (params?.limit) url.searchParams.set("limit_page_length", String(params.limit));
        if (params?.offset) url.searchParams.set("limit_start", String(params.offset));

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: this.getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new AppError("Failed to fetch purchase invoices", 401);
        }

        return data;
    }

    async getPurchaseInvoiceById(id: string) {
        const url = this.getApiUrl(`Purchase Invoice/${id}`);

        const response = await fetch(url, {
            method: "GET",
            headers: this.getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new AppError("Purchase invoice not found", 404);
        }

        return data;
    }

    async createSalesInvoice(
        payload: ERPNextSalesInvoicePayload
    ): Promise<ERPNextResponse> {
        const url = this.getApiUrl("Sales Invoice");

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext Sales Invoice Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data._server_messages,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    "Failed to create sales invoice"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;

            console.error("ERPNext Client Error (Sales Invoice):", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async getSalesInvoices(params?: { limit?: number; offset?: number }) {
        const url = new URL(this.getApiUrl("Sales Invoice"));

        url.searchParams.set(
            "fields",
            JSON.stringify([
                "name",
                "customer",
                "posting_date",
                "grand_total",
                "status",
            ])
        );

        url.searchParams.set(
            "limit_page_length",
            String(params?.limit ?? 20)
        );

        if (params?.offset) {
            url.searchParams.set("limit_start", String(params.offset));
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: this.getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("ERPNext Sales Invoice fetch failed", {
                status: response.status,
                data,
            });
            throw new AppError("Failed to fetch sales invoices", response.status);
        }

        return data;
    }

    async getSalesInvoiceById(id: string) {
        const url = this.getApiUrl(`Sales Invoice/${id}`);

        const response = await fetch(url, {
            method: "GET",
            headers: this.getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new AppError("Sales invoice not found", 404);
        }

        return data;
    }

    async getItemStock(itemCode: string): Promise<number> {
        const url = new URL(this.getApiUrl("Bin"));

        url.searchParams.set(
            "filters",
            JSON.stringify([["item_code", "=", itemCode]])
        );
        url.searchParams.set("fields", JSON.stringify(["actual_qty"]));

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: this.getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new AppError("Failed to fetch stock", 500);
        }

        return Array.isArray(data.data)
            ? data.data.reduce((sum: number, row: any) => sum + (row.actual_qty || 0), 0)
            : 0;
    }


    private async fetchList(
        resource: string,
        params: Record<string, any>
    ) {
        const url = new URL(this.getApiUrl(resource));

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.set(key, String(value));
            }
        });

        const res = await fetch(url.toString(), {
            headers: this.getHeaders(),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error(`ERPNext ${resource} fetch error`, {
                status: res.status,
                data: data?._server_messages,
            });
            throw new AppError(`Failed to fetch ${resource}`, res.status);
        }

        return data;
    }


    // Common resources
    async getCompanies() {
        return this.fetchList("Company", {
            fields: JSON.stringify([
                "name",
                "company_name",
                "default_currency",
                "country",
            ]),
            limit_page_length: 50,
        });
    }


    async getWarehouses() {
        return this.fetchList("Warehouse", {
            fields: JSON.stringify([
                "name",
                "warehouse_name",
                "company",
                "is_group",
            ]),
            limit_page_length: 200,
        });
    }



    async getSuppliers(params?: { limit?: number; offset?: number }) {
        return this.fetchList("Supplier", {
            fields: JSON.stringify([
                "name",
                "supplier_name",
                "supplier_type",
                "email",
                "mobile_no",
            ]),
            limit_page_length: params?.limit ?? 50,
            limit_start: params?.offset ?? 0,
        });
    }



    async getCustomers(params?: { limit?: number; offset?: number }) {
        return this.fetchList("Customer", {
            fields: JSON.stringify([
                "name",
                "customer_name",
                "customer_type",
                "creation",
                "modified",
            ]),
            limit_page_length: params?.limit ?? 50,
            limit_start: params?.offset ?? 0,
        });
    }



    private async fetchResource(resource: string) {
        const url = new URL(this.getApiUrl(resource));

        url.searchParams.set("fields", JSON.stringify(["name"]));
        url.searchParams.set("limit_page_length", "100");

        const res = await fetch(url.toString(), {
            headers: this.getHeaders(),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("ERPNext fetchResource failed", {
                resource,
                status: res.status,
                response: data,
                url: url.toString(),
            });

            throw new AppError(
                `Failed to fetch ${resource}`,
                res.status === 401 || res.status === 403 ? 403 : 500
            );
        }

        return Array.isArray(data.data) ? data.data : [];
    }

    async getLowStockItems(threshold = 10) {
        return this.fetchList("Bin", {
            fields: JSON.stringify([
                "item_code",
                "warehouse",
                "actual_qty",
                "projected_qty",
            ]),
            filters: JSON.stringify([
                ["actual_qty", "<=", threshold],
            ]),
            limit_page_length: 200,
        });
    }



    // Customer Management Methods
    async createCustomer(payload: Record<string, any>): Promise<ERPNextResponse> {
        const url = this.getApiUrl("Customer");

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data._server_messages,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    "Failed to create customer in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async updateCustomer(customerId: string, payload: Record<string, any>): Promise<ERPNextResponse> {
        const url = this.getApiUrl(`Customer/${customerId}`);

        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data._server_messages,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    "Failed to update customer in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async deleteCustomer(customerId: string): Promise<ERPNextResponse> {
        const url = this.getApiUrl(`Customer/${customerId}`);

        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: this.getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    data.message || data.exc || "Failed to delete customer in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async getCustomerById(customerId: string): Promise<ERPNextResponse> {
        const url = this.getApiUrl(`Customer/${customerId}`);

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: this.getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    data.message || data.exc || "Customer not found"
                );

                throw new AppError(errorMessage, response.status === 404 ? 404 : 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }



    //in this the main error that is 401 Unauthorized  User <strong>erpnext@knitnexus.com</strong> does not have doctype access via role permission for document <strong>Supplier</strong>


    async createSupplier(payload: Record<string, any>): Promise<ERPNextResponse> {
        const url = this.getApiUrl("Supplier");

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });
            console.log(response);
            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data._server_messages,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    "Failed to create supplier in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async updateSupplier(supplierId: string, payload: Record<string, any>): Promise<ERPNextResponse> {
        const url = this.getApiUrl(`Supplier/${supplierId}`);

        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data._server_messages,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    "Failed to update supplier in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async deleteSupplier(supplierId: string): Promise<ERPNextResponse> {
        const url = this.getApiUrl(`Supplier/${supplierId}`);

        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: this.getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    data.message || data.exc || "Failed to delete supplier in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async getSupplierById(supplierId: string): Promise<ERPNextResponse> {
        const url = this.getApiUrl(`Supplier/${supplierId}`);

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: this.getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    data.message || data.exc || "Supplier not found"
                );

                throw new AppError(errorMessage, response.status === 404 ? 404 : 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    // Address Management Methods
    async createAddress(payload: Record<string, any>): Promise<ERPNextResponse> {
        const url = this.getApiUrl("Address");

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data._server_messages,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    "Failed to create address in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async updateAddress(addressId: string, payload: Record<string, any>): Promise<ERPNextResponse> {
        const url = this.getApiUrl(`Address/${addressId}`);

        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data._server_messages,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    "Failed to update address in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async deleteAddress(addressId: string): Promise<ERPNextResponse> {
        const url = this.getApiUrl(`Address/${addressId}`);

        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: this.getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    data.message || data.exc || "Failed to delete address in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async getAddressesByEntity(linkDoctype: string, linkName: string): Promise<ERPNextResponse> {
        const url = new URL(this.getApiUrl("Address"));

        url.searchParams.set(
            "filters",
            JSON.stringify([
                ["Dynamic Link", "link_doctype", "=", linkDoctype],
                ["Dynamic Link", "link_name", "=", linkName]
            ])
        );

        try {
            const response = await fetch(url.toString(), {
                method: "GET",
                headers: this.getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    url: url.toString().replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    data.message || data.exc || "Failed to fetch addresses"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) throw error;

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    // Contact Management Methods
    async createContact(payload: Record<string, any>): Promise<ERPNextResponse> {
        const url = this.getApiUrl("Contact");

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERPNext API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data._server_messages,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                const errorMessage = parseERPNextErrorMessage(
                    data._server_messages,
                    "Failed to create contact in ERPNext"
                );

                throw new AppError(errorMessage, 401);
            }

            return data;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error("ERPNext Client Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            throw new AppError("Failed to communicate with ERPNext server", 500);
        }
    }

    async testConnection(): Promise<{
        success: boolean;
        connected_user?: string;
        error?: string;
    }> {
        const url = this.getMethodUrl("frappe.auth.get_logged_user");

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) {
                let errorMessage = "Connection test failed";

                if (response.status === 401 || response.status === 403) {
                    errorMessage = "Invalid ERP credentials";
                } else if (response.status === 404) {
                    errorMessage = "ERPNext endpoint not found - check domain URL";
                } else if (response.status >= 500) {
                    errorMessage = "ERPNext server error";
                }

                console.error("ERPNext Connection Test Failed:", {
                    status: response.status,
                    statusText: response.statusText,
                    domain: this.credentials.erpDomain,
                    url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
                });

                return {
                    success: false,
                    error: errorMessage,
                };
            }

            const data = await response.json();

            const connectedUser =
                typeof data.message === "string"
                    ? data.message
                    : data.message?.email || "Unknown user";

            return {
                success: true,
                connected_user: connectedUser,
            };
        } catch (error) {
            console.error("ERPNext Connection Test Error:", {
                message: error instanceof Error ? error.message : "Unknown error",
                name: error instanceof Error ? error.name : "UnknownError",
                domain: this.credentials.erpDomain,
                url: url.replace(this.credentials.apiSecret, "[REDACTED]"),
            });

            let errorMessage = "Failed to connect to ERPNext server";

            if (error instanceof Error) {
                if (error.name === "AbortError" || error.message.includes("timeout")) {
                    errorMessage = "Connection timeout - ERPNext server not responding";
                } else if (error.message.includes("fetch")) {
                    errorMessage = "Network error - unable to reach ERPNext server";
                }
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }
}

export function createERPNextClientFromEncrypted(
    encryptedCredentials: ERPNextEncryptedCredentials
): ERPNextClient {
    try {
        if (!encryptedCredentials.encryptedApiKey) {
            throw new Error("Missing encrypted API key");
        }

        if (!encryptedCredentials.encryptedApiSecret) {
            throw new Error("Missing encrypted API secret");
        }

        const apiKey = decrypt(encryptedCredentials.encryptedApiKey);
        const apiSecret = decrypt(encryptedCredentials.encryptedApiSecret);

        return new ERPNextClient({
            erpDomain: encryptedCredentials.erpDomain,
            apiKey,
            apiSecret,
        });
    } catch (error) {
        console.error("Failed to decrypt ERPNext credentials:", {
            error: error instanceof Error ? error.message : "Unknown error",
            domain: encryptedCredentials.erpDomain,
        });

        throw new AppError(
            "Failed to initialize ERPNext client - invalid credentials",
            500
        );
    }
}