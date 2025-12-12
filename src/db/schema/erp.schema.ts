import {
  pgTable,
  serial,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user.schema";

export const erpConnections = pgTable("erp_connections", {
  id: serial("id").primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  erpDomain: text("erp_domain").notNull(),

  encryptedApiKey: text("encrypted_api_key").notNull(),
  encryptedApiSecret: text("encrypted_api_secret").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const erpConnectionsRelations = relations(erpConnections, ({ one }) => ({
  user: one(users, {
    fields: [erpConnections.userId],
    references: [users.id],
  }),
}));

export type ErpConnection = typeof erpConnections.$inferSelect;
export type NewErpConnection = typeof erpConnections.$inferInsert;
