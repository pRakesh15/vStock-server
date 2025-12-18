import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { getERPClientForUser } from "../erp/erpConnection.service";
import {
  mapCreateProductToERP,
  mapEditProductToERP,
} from "./product.mapper";
import type {
  CreateProductInput,
  EditProductInput,
  GetProductsQuery,
} from "./product.types";
import { generateBarcode } from "../../utils/barcode.util";

class ProductService {
  async create(userId: string, data: CreateProductInput) {
    const erpClient = await getERPClientForUser(userId);

    const barcode = data.barcode ?? generateBarcode("PRD");

    const payload = mapCreateProductToERP({
      ...data,
      barcode,
    });

    await erpClient.createItem(payload);

    return {
      barcode,
    };
  }

  async update(userId: string, itemId: string, data: EditProductInput) {
    const erpClient = await getERPClientForUser(userId);
    await erpClient.updateItem(itemId, mapEditProductToERP(data));
  }

  async delete(userId: string, itemId: string) {
    const erpClient = await getERPClientForUser(userId);
    await erpClient.deleteItem(itemId);
  }

  async getById(userId: string, itemId: string) {
    const erpClient = await getERPClientForUser(userId);
    const res = await erpClient.getItems({
      filters: JSON.stringify([["Item", "item_code", "=", itemId]]),
      limit_page_length: 1,
    });
    return res.data?.[0] ?? null;
  }

  async list(userId: string, query: GetProductsQuery) {
    const erpClient = await getERPClientForUser(userId);

    const filters: any = {
      limit_start: (query.page - 1) * query.limit,
      limit_page_length: query.limit,
    };

    if (query.search) {
      filters.or_filters = JSON.stringify([
        ["item_name", "like", `%${query.search}%`],
        ["item_code", "like", `%${query.search}%`],
      ]);
    }

    return erpClient.getItems(filters);
  }

  async getPublicByBarcode(tenantId: string, barcode: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, tenantId))
      .limit(1);

    if (!user) return null;

    const erpClient = await getERPClientForUser(user.id);
    const res = await erpClient.getItems({
      filters: JSON.stringify([["Item", "custom_barcode", "=", barcode]]),
      limit_page_length: 1,
    });

    return res.data?.[0] ?? null;
  }
}

export const productService = new ProductService();
