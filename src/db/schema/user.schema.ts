// src/db/schema/user.schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { erpConnections } from "./erp.schema";

export const userRoleEnum = pgEnum("user_role", ["admin", "client"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: varchar("email", { length: 255 }).unique().notNull(),

  passwordHash: text("password_hash").notNull(),

  role: userRoleEnum("role").default("client").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  erpConnection: one(erpConnections, {
    fields: [users.id],
    references: [erpConnections.userId],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
