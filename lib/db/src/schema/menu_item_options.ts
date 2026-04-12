import { pgTable, serial, integer, varchar, real } from "drizzle-orm/pg-core";
import { menuItemsTable } from "./menu_items";

export const menuItemOptionsTable = pgTable("menu_item_options", {
  id: serial("id").primaryKey(),
  menuItemId: integer("menu_item_id").notNull().references(() => menuItemsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 50 }).notNull(),
  price: real("price").notNull().default(0),
  displayOrder: integer("display_order").notNull().default(0),
});

export type MenuItemOption = typeof menuItemOptionsTable.$inferSelect;
export type InsertMenuItemOption = typeof menuItemOptionsTable.$inferInsert;
