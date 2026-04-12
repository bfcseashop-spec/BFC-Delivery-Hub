import { pgTable, serial, text, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const promoBannersTable = pgTable("promo_banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  badge: text("badge").notNull().default(""),
  gradient: text("gradient").notNull().default("bg-gradient-to-br from-orange-500 to-red-500"),
  emoji: text("emoji").notNull().default("🎉"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertPromoBannerSchema = createInsertSchema(promoBannersTable).omit({ id: true });
export type InsertPromoBanner = z.infer<typeof insertPromoBannerSchema>;
export type PromoBanner = typeof promoBannersTable.$inferSelect;
