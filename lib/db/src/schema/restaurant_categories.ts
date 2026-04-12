import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";
import { restaurantsTable } from "./restaurants";

export const restaurantCategoriesTable = pgTable("restaurant_categories", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurantsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export type RestaurantCategory = typeof restaurantCategoriesTable.$inferSelect;
export type InsertRestaurantCategory = typeof restaurantCategoriesTable.$inferInsert;
