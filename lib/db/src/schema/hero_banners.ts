import { pgTable, serial, text, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const heroBannersTable = pgTable("hero_banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  ctaText: text("cta_text").notNull().default("Sign up free"),
  ctaLink: text("cta_link").notNull().default("/signup"),
  emoji: text("emoji").notNull().default("🛵"),
  gradient: text("gradient").notNull().default("from-orange-50 to-amber-50"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertHeroBannerSchema = createInsertSchema(heroBannersTable).omit({ id: true });
export type InsertHeroBanner = z.infer<typeof insertHeroBannerSchema>;
export type HeroBanner = typeof heroBannersTable.$inferSelect;
