import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, ordersTable, restaurantsTable, menuItemsTable, usersTable } from "@workspace/db";
import { eq, and, type SQL } from "drizzle-orm";
import {
  AdminListOrdersResponse,
  AdminUpdateOrderStatusBody,
  AdminUpdateOrderStatusParams,
  AdminCreateRestaurantBody,
  AdminUpdateRestaurantBody,
  AdminUpdateRestaurantParams,
  AdminDeleteRestaurantParams,
  AdminCreateMenuItemBody,
  AdminUpdateMenuItemBody,
  AdminUpdateMenuItemParams,
  AdminDeleteMenuItemParams,
  AdminGetStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId || req.session.userRole !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

router.use("/admin", requireAdmin as Parameters<typeof router.use>[0]);

router.get("/admin/orders", async (req, res): Promise<void> => {
  const status = req.query.status as string | undefined;
  const conditions: SQL[] = [];
  if (status) {
    conditions.push(eq(ordersTable.status, status));
  }

  let query = db.select().from(ordersTable).$dynamic();
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const orders = await query.orderBy(ordersTable.createdAt);
  const mapped = orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() }));
  res.json(AdminListOrdersResponse.parse(mapped));
});

router.patch("/admin/orders/:orderId/status", async (req, res): Promise<void> => {
  const params = AdminUpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = AdminUpdateOrderStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: body.data.status })
    .where(eq(ordersTable.id, params.data.orderId))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json({ ...order, createdAt: order.createdAt.toISOString() });
});

router.post("/admin/restaurants", async (req, res): Promise<void> => {
  const parsed = AdminCreateRestaurantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [restaurant] = await db.insert(restaurantsTable).values({
    name: parsed.data.name,
    description: parsed.data.description,
    imageUrl: parsed.data.imageUrl,
    rating: parsed.data.rating ?? 4.5,
    reviewCount: parsed.data.reviewCount ?? 0,
    deliveryTime: parsed.data.deliveryTime,
    minimumOrder: parsed.data.minimumOrder,
    categoryId: parsed.data.categoryId,
    categoryName: parsed.data.categoryName,
    address: parsed.data.address,
    isOpen: parsed.data.isOpen ?? true,
    isFeatured: parsed.data.isFeatured ?? false,
  }).returning();

  res.status(201).json(restaurant);
});

router.patch("/admin/restaurants/:restaurantId", async (req, res): Promise<void> => {
  const params = AdminUpdateRestaurantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AdminUpdateRestaurantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Partial<typeof restaurantsTable.$inferInsert> = {};
  if (parsed.data.name != null) updates.name = parsed.data.name;
  if (parsed.data.description != null) updates.description = parsed.data.description;
  if (parsed.data.imageUrl != null) updates.imageUrl = parsed.data.imageUrl;
  if (parsed.data.rating != null) updates.rating = parsed.data.rating;
  if (parsed.data.reviewCount != null) updates.reviewCount = parsed.data.reviewCount;
  if (parsed.data.deliveryTime != null) updates.deliveryTime = parsed.data.deliveryTime;
  if (parsed.data.minimumOrder != null) updates.minimumOrder = parsed.data.minimumOrder;
  if (parsed.data.categoryId != null) updates.categoryId = parsed.data.categoryId;
  if (parsed.data.categoryName != null) updates.categoryName = parsed.data.categoryName;
  if (parsed.data.address != null) updates.address = parsed.data.address;
  if (parsed.data.isOpen != null) updates.isOpen = parsed.data.isOpen;
  if (parsed.data.isFeatured != null) updates.isFeatured = parsed.data.isFeatured;

  const [restaurant] = await db
    .update(restaurantsTable)
    .set(updates)
    .where(eq(restaurantsTable.id, params.data.restaurantId))
    .returning();

  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }

  res.json(restaurant);
});

router.delete("/admin/restaurants/:restaurantId", async (req, res): Promise<void> => {
  const params = AdminDeleteRestaurantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(restaurantsTable).where(eq(restaurantsTable.id, params.data.restaurantId));
  res.sendStatus(204);
});

router.post("/admin/menu-items", async (req, res): Promise<void> => {
  const parsed = AdminCreateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(menuItemsTable).values({
    restaurantId: parsed.data.restaurantId,
    name: parsed.data.name,
    description: parsed.data.description,
    price: parsed.data.price,
    imageUrl: parsed.data.imageUrl,
    category: parsed.data.category,
    isAvailable: parsed.data.isAvailable ?? true,
    isPopular: parsed.data.isPopular ?? false,
  }).returning();

  res.status(201).json(item);
});

router.patch("/admin/menu-items/:menuItemId", async (req, res): Promise<void> => {
  const params = AdminUpdateMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AdminUpdateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Partial<typeof menuItemsTable.$inferInsert> = {};
  if (parsed.data.name != null) updates.name = parsed.data.name;
  if (parsed.data.description != null) updates.description = parsed.data.description;
  if (parsed.data.price != null) updates.price = parsed.data.price;
  if (parsed.data.imageUrl != null) updates.imageUrl = parsed.data.imageUrl;
  if (parsed.data.category != null) updates.category = parsed.data.category;
  if (parsed.data.isAvailable != null) updates.isAvailable = parsed.data.isAvailable;
  if (parsed.data.isPopular != null) updates.isPopular = parsed.data.isPopular;

  const [item] = await db
    .update(menuItemsTable)
    .set(updates)
    .where(eq(menuItemsTable.id, params.data.menuItemId))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.json(item);
});

router.delete("/admin/menu-items/:menuItemId", async (req, res): Promise<void> => {
  const params = AdminDeleteMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(menuItemsTable).where(eq(menuItemsTable.id, params.data.menuItemId));
  res.sendStatus(204);
});

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const [restaurants, orders, users, menuItems] = await Promise.all([
    db.select().from(restaurantsTable),
    db.select().from(ordersTable),
    db.select().from(usersTable),
    db.select().from(menuItemsTable),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => ["pending", "confirmed", "preparing", "out_for_delivery"].includes(o.status)).length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today).length;

  res.json(AdminGetStatsResponse.parse({
    totalRestaurants: restaurants.length,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
    todayOrders,
    totalMenuItems: menuItems.length,
  }));
});

export default router;
