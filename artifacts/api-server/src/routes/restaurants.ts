import { Router, type IRouter } from "express";
import { db, restaurantsTable } from "@workspace/db";
import { eq, like, and, type SQL } from "drizzle-orm";
import {
  ListRestaurantsResponse,
  ListRestaurantsQueryParams,
  GetRestaurantParams,
  GetRestaurantResponse,
  ListFeaturedRestaurantsResponse,
  GetStatsOverviewResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/restaurants/featured", async (_req, res): Promise<void> => {
  const restaurants = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.isFeatured, true));
  res.json(ListFeaturedRestaurantsResponse.parse(restaurants));
});

router.get("/restaurants", async (req, res): Promise<void> => {
  const parsed = ListRestaurantsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { categoryId, search, limit } = parsed.data;
  const conditions: SQL[] = [];

  if (categoryId != null) {
    conditions.push(eq(restaurantsTable.categoryId, categoryId));
  }
  if (search) {
    conditions.push(like(restaurantsTable.name, `%${search}%`));
  }

  let query = db
    .select()
    .from(restaurantsTable)
    .$dynamic();

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (limit != null) {
    query = query.limit(limit);
  }

  const restaurants = await query;
  res.json(ListRestaurantsResponse.parse(restaurants));
});

router.get("/restaurants/:restaurantId", async (req, res): Promise<void> => {
  const params = GetRestaurantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, params.data.restaurantId));

  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }

  res.json(GetRestaurantResponse.parse(restaurant));
});

router.get("/stats/overview", async (_req, res): Promise<void> => {
  const restaurants = await db.select().from(restaurantsTable);
  const { categoriesTable } = await import("@workspace/db");
  const categories = await db.select().from(categoriesTable);
  const { ordersTable } = await import("@workspace/db");
  const orders = await db.select().from(ordersTable);

  res.json(GetStatsOverviewResponse.parse({
    totalRestaurants: restaurants.length,
    totalOrders: orders.length,
    totalCategories: categories.length,
    avgDeliveryTime: "30 min",
  }));
});

export default router;
