import { pgTable, serial, text, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quickFiltersTable = pgTable("quick_filters", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  filterKey: text("filter_key").notNull(),
  filterValue: text("filter_value").notNull().default("true"),
  filterType: text("filter_type").notNull().default("boolean"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertQuickFilterSchema = createInsertSchema(quickFiltersTable).omit({ id: true });
export type InsertQuickFilter = z.infer<typeof insertQuickFilterSchema>;
export type QuickFilter = typeof quickFiltersTable.$inferSelect;
