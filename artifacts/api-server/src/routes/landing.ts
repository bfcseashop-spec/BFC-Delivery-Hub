import { Router, type IRouter } from "express";
import { db, promoBannersTable, quickFiltersTable, pageSettingsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/landing/banners", async (_req, res): Promise<void> => {
  const banners = await db
    .select()
    .from(promoBannersTable)
    .where(eq(promoBannersTable.isActive, true))
    .orderBy(asc(promoBannersTable.displayOrder));
  res.json(banners);
});

router.get("/landing/filters", async (_req, res): Promise<void> => {
  const filters = await db
    .select()
    .from(quickFiltersTable)
    .where(eq(quickFiltersTable.isActive, true))
    .orderBy(asc(quickFiltersTable.displayOrder));
  res.json(filters);
});

router.get("/landing/settings", async (_req, res): Promise<void> => {
  const settings = await db.select().from(pageSettingsTable);
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  res.json(map);
});

export default router;
