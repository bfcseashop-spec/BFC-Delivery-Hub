import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const partnersTable = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  businessName: text("business_name").notNull(),
  restaurantId: integer("restaurant_id"),
  status: text("status").notNull().default("pending"),
  contractType: text("contract_type").notNull().default("standard"),
  commissionRate: real("commission_rate").notNull().default(15),
  notes: text("notes").notNull().default(""),
  username: text("username").notNull().default(""),
  passwordHash: text("password_hash").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPartnerSchema = createInsertSchema(partnersTable).omit({ id: true, createdAt: true });
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partnersTable.$inferSelect;
