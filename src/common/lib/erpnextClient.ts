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

        // Ensure protocol is included
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

        // Use util to get correct field names including custom_ ones
        searchParams.append("fields", JSON.stringify(getERPItemFieldNames()));

        // Filters (optional)
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    // Ensure custom fields are correctly named in filters too
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

            // Optional: map ERP response to frontend format
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

    async getSalesInvoices(params?: {
        limit?: number;
        offset?: number;
    }) {
        const url = new URL(this.getApiUrl("Sales Invoice"));

        url.searchParams.set("fields", JSON.stringify([
            "name",
            "customer",
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
            throw new AppError("Failed to fetch sales invoices", 401);
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

    //common resources

    async getCompanies() {
        return this.fetchResource("Company");
    }

    async getWarehouses() {
        return this.fetchResource("Warehouse");
    }

    async getSuppliers() {
        return this.fetchResource("Supplier");
    }

    async getCustomers() {
        return this.fetchResource("Customer");
    }

    private async fetchResource(resource: string) {
        const url = this.getApiUrl(resource);
        const res = await fetch(url, { headers: this.getHeaders() });
        const data = await res.json();

        if (!res.ok) {
            throw new AppError(`Failed to fetch ${resource}`, 500);
        }

        return data.data;
    }

    async getLowStockItems(threshold: number) {
        const url = new URL(this.getApiUrl("Bin"));

        url.searchParams.set(
            "filters",
            JSON.stringify([["actual_qty", "<=", threshold]])
        );

        url.searchParams.set(
            "fields",
            JSON.stringify([
                "item_code",
                "warehouse",
                "actual_qty"
            ])
        );

        const res = await fetch(url.toString(), {
            headers: this.getHeaders(),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new AppError("Failed to fetch low stock items", 500);
        }

        return data.data;
    }



    async testConnection(): Promise<{
        success: boolean;
        connected_user?: string;
        error?: string;
    }> {
        const url = this.getMethodUrl("frappe.auth.get_logged_user");
        console.log(url)
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
