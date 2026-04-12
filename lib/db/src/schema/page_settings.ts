import { pgTable, text } from "drizzle-orm/pg-core";

export const pageSettingsTable = pgTable("page_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type PageSetting = typeof pageSettingsTable.$inferSelect;
