import { Router, type IRouter } from "express";
import { db, menuItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetRestaurantMenuParams, GetRestaurantMenuResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/restaurants/:restaurantId/menu", async (req, res): Promise<void> => {
  const params = GetRestaurantMenuParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const items = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.restaurantId, params.data.restaurantId));

  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  const sections = Object.entries(grouped).map(([category, groupItems]) => ({
    category,
    items: groupItems,
  }));

  res.json(GetRestaurantMenuResponse.parse(sections));
});

export default router;
