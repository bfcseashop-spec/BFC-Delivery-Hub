import { pgTable, serial, text, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const restaurantsTable = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: real("rating").notNull().default(4.5),
  reviewCount: integer("review_count").notNull().default(0),
  deliveryTime: text("delivery_time").notNull().default("20-30 min"),
  minimumOrder: real("minimum_order").notNull().default(5),
  categoryId: integer("category_id").notNull(),
  categoryName: text("category_name").notNull(),
  address: text("address").notNull(),
  isOpen: boolean("is_open").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
});

export const insertRestaurantSchema = createInsertSchema(restaurantsTable).omit({ id: true });
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurantsTable.$inferSelect;
