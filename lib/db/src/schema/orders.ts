import { pgTable, serial, text, real, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  restaurantName: text("restaurant_name").notNull(),
  items: jsonb("items").notNull().$type<Array<{menuItemId: number; name: string; price: number; quantity: number}>>(),
  totalAmount: real("total_amount").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  status: text("status").notNull().default("pending"),
  estimatedDelivery: text("estimated_delivery").notNull().default("30-45 min"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
