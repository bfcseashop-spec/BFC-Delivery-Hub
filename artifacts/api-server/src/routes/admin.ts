import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, ordersTable, restaurantsTable, menuItemsTable, usersTable, promoBannersTable, quickFiltersTable, pageSettingsTable, heroBannersTable, restaurantCategoriesTable, menuItemOptionsTable, partnersTable } from "@workspace/db";
import { eq, and, asc, type SQL } from "drizzle-orm";
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
    images: parsed.data.images ?? "[]",
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
  if (parsed.data.images != null) updates.images = parsed.data.images;
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

// ── Restaurant Categories ──────────────────────────────────────────────────

router.get("/admin/restaurants/:restaurantId/categories", requireAdmin, async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurantId" }); return; }
  const rows = await db
    .select()
    .from(restaurantCategoriesTable)
    .where(eq(restaurantCategoriesTable.restaurantId, restaurantId))
    .orderBy(asc(restaurantCategoriesTable.displayOrder), asc(restaurantCategoriesTable.name));
  res.json(rows);
});

router.post("/admin/restaurants/:restaurantId/categories", requireAdmin, async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurantId" }); return; }
  const { name } = req.body as { name: string };
  if (!name?.trim()) { res.status(400).json({ error: "Category name is required" }); return; }
  const existing = await db.select().from(restaurantCategoriesTable)
    .where(and(eq(restaurantCategoriesTable.restaurantId, restaurantId), eq(restaurantCategoriesTable.name, name.trim())));
  if (existing.length > 0) { res.status(409).json({ error: "Category already exists" }); return; }
  const maxOrder = await db.select().from(restaurantCategoriesTable)
    .where(eq(restaurantCategoriesTable.restaurantId, restaurantId))
    .orderBy(asc(restaurantCategoriesTable.displayOrder));
  const [row] = await db.insert(restaurantCategoriesTable).values({
    restaurantId, name: name.trim(), displayOrder: maxOrder.length,
  }).returning();
  res.status(201).json(row);
});

router.delete("/admin/restaurants/:restaurantId/categories/:categoryId", requireAdmin, async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId);
  const categoryId = parseInt(req.params.categoryId);
  if (isNaN(restaurantId) || isNaN(categoryId)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(restaurantCategoriesTable)
    .where(and(eq(restaurantCategoriesTable.id, categoryId), eq(restaurantCategoriesTable.restaurantId, restaurantId)));
  res.sendStatus(204);
});

// ── Menu Item Options ──────────────────────────────────────────────────────

router.get("/admin/menu-items/:menuItemId/options", requireAdmin, async (req, res): Promise<void> => {
  const menuItemId = parseInt(req.params.menuItemId);
  if (isNaN(menuItemId)) { res.status(400).json({ error: "Invalid menuItemId" }); return; }
  const rows = await db
    .select()
    .from(menuItemOptionsTable)
    .where(eq(menuItemOptionsTable.menuItemId, menuItemId))
    .orderBy(asc(menuItemOptionsTable.displayOrder));
  res.json(rows);
});

router.post("/admin/menu-items/:menuItemId/options", requireAdmin, async (req, res): Promise<void> => {
  const menuItemId = parseInt(req.params.menuItemId);
  if (isNaN(menuItemId)) { res.status(400).json({ error: "Invalid menuItemId" }); return; }
  const { name, price } = req.body as { name: string; price: number };
  if (!name?.trim()) { res.status(400).json({ error: "Option name is required" }); return; }
  const existing = await db.select().from(menuItemOptionsTable)
    .where(eq(menuItemOptionsTable.menuItemId, menuItemId))
    .orderBy(asc(menuItemOptionsTable.displayOrder));
  const [row] = await db.insert(menuItemOptionsTable).values({
    menuItemId, name: name.trim(), price: Number(price) || 0, displayOrder: existing.length,
  }).returning();
  res.status(201).json(row);
});

router.patch("/admin/menu-item-options/:optionId", requireAdmin, async (req, res): Promise<void> => {
  const optionId = parseInt(req.params.optionId);
  if (isNaN(optionId)) { res.status(400).json({ error: "Invalid optionId" }); return; }
  const { name, price } = req.body as { name?: string; price?: number };
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (price !== undefined) updates.price = Number(price);
  const [row] = await db.update(menuItemOptionsTable).set(updates).where(eq(menuItemOptionsTable.id, optionId)).returning();
  if (!row) { res.status(404).json({ error: "Option not found" }); return; }
  res.json(row);
});

router.delete("/admin/menu-item-options/:optionId", requireAdmin, async (req, res): Promise<void> => {
  const optionId = parseInt(req.params.optionId);
  if (isNaN(optionId)) { res.status(400).json({ error: "Invalid optionId" }); return; }
  await db.delete(menuItemOptionsTable).where(eq(menuItemOptionsTable.id, optionId));
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

// ---- Hero Banners (carousel) CRUD ----

router.get("/admin/landing/hero-banners", async (_req, res): Promise<void> => {
  const banners = await db.select().from(heroBannersTable).orderBy(asc(heroBannersTable.displayOrder));
  res.json(banners);
});

router.post("/admin/landing/hero-banners", async (req, res): Promise<void> => {
  const { title, subtitle, ctaText, ctaLink, emoji, gradient, imageUrl, isActive, displayOrder } = req.body;
  if (!title) { res.status(400).json({ error: "title is required" }); return; }
  const [banner] = await db.insert(heroBannersTable).values({
    title, subtitle: subtitle ?? "", ctaText: ctaText ?? "Sign up free", ctaLink: ctaLink ?? "/signup",
    emoji: emoji ?? "🛵", gradient: gradient ?? "from-orange-50 to-amber-50",
    imageUrl: imageUrl ?? "",
    isActive: isActive ?? true, displayOrder: displayOrder ?? 0,
  }).returning();
  res.status(201).json(banner);
});

router.patch("/admin/landing/hero-banners/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { title, subtitle, ctaText, ctaLink, emoji, gradient, imageUrl, isActive, displayOrder } = req.body;
  const updates: Partial<typeof heroBannersTable.$inferInsert> = {};
  if (title != null) updates.title = title;
  if (subtitle != null) updates.subtitle = subtitle;
  if (ctaText != null) updates.ctaText = ctaText;
  if (ctaLink != null) updates.ctaLink = ctaLink;
  if (emoji != null) updates.emoji = emoji;
  if (gradient != null) updates.gradient = gradient;
  if (imageUrl != null) updates.imageUrl = imageUrl;
  if (isActive != null) updates.isActive = isActive;
  if (displayOrder != null) updates.displayOrder = displayOrder;
  const [banner] = await db.update(heroBannersTable).set(updates).where(eq(heroBannersTable.id, id)).returning();
  if (!banner) { res.status(404).json({ error: "Banner not found" }); return; }
  res.json(banner);
});

router.delete("/admin/landing/hero-banners/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(heroBannersTable).where(eq(heroBannersTable.id, id));
  res.sendStatus(204);
});

// ---- Promo Banners CRUD ----

router.get("/admin/landing/banners", async (_req, res): Promise<void> => {
  const banners = await db.select().from(promoBannersTable).orderBy(asc(promoBannersTable.displayOrder));
  res.json(banners);
});

router.post("/admin/landing/banners", async (req, res): Promise<void> => {
  const { title, subtitle, badge, gradient, emoji, isActive, displayOrder } = req.body;
  if (!title) { res.status(400).json({ error: "title is required" }); return; }
  const [banner] = await db.insert(promoBannersTable).values({ title, subtitle: subtitle ?? "", badge: badge ?? "", gradient: gradient ?? "bg-gradient-to-br from-orange-500 to-red-500", emoji: emoji ?? "🎉", isActive: isActive ?? true, displayOrder: displayOrder ?? 0 }).returning();
  res.status(201).json(banner);
});

router.patch("/admin/landing/banners/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { title, subtitle, badge, gradient, emoji, isActive, displayOrder } = req.body;
  const updates: Partial<typeof promoBannersTable.$inferInsert> = {};
  if (title != null) updates.title = title;
  if (subtitle != null) updates.subtitle = subtitle;
  if (badge != null) updates.badge = badge;
  if (gradient != null) updates.gradient = gradient;
  if (emoji != null) updates.emoji = emoji;
  if (isActive != null) updates.isActive = isActive;
  if (displayOrder != null) updates.displayOrder = displayOrder;
  const [banner] = await db.update(promoBannersTable).set(updates).where(eq(promoBannersTable.id, id)).returning();
  if (!banner) { res.status(404).json({ error: "Banner not found" }); return; }
  res.json(banner);
});

router.delete("/admin/landing/banners/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(promoBannersTable).where(eq(promoBannersTable.id, id));
  res.sendStatus(204);
});

// ---- Quick Filters CRUD ----

router.get("/admin/landing/filters", async (_req, res): Promise<void> => {
  const filters = await db.select().from(quickFiltersTable).orderBy(asc(quickFiltersTable.displayOrder));
  res.json(filters);
});

router.post("/admin/landing/filters", async (req, res): Promise<void> => {
  const { label, filterKey, filterValue, filterType, isActive, displayOrder } = req.body;
  if (!label || !filterKey) { res.status(400).json({ error: "label and filterKey are required" }); return; }
  const [filter] = await db.insert(quickFiltersTable).values({ label, filterKey, filterValue: filterValue ?? "true", filterType: filterType ?? "boolean", isActive: isActive ?? true, displayOrder: displayOrder ?? 0 }).returning();
  res.status(201).json(filter);
});

router.patch("/admin/landing/filters/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { label, filterKey, filterValue, filterType, isActive, displayOrder } = req.body;
  const updates: Partial<typeof quickFiltersTable.$inferInsert> = {};
  if (label != null) updates.label = label;
  if (filterKey != null) updates.filterKey = filterKey;
  if (filterValue != null) updates.filterValue = filterValue;
  if (filterType != null) updates.filterType = filterType;
  if (isActive != null) updates.isActive = isActive;
  if (displayOrder != null) updates.displayOrder = displayOrder;
  const [filter] = await db.update(quickFiltersTable).set(updates).where(eq(quickFiltersTable.id, id)).returning();
  if (!filter) { res.status(404).json({ error: "Filter not found" }); return; }
  res.json(filter);
});

router.delete("/admin/landing/filters/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(quickFiltersTable).where(eq(quickFiltersTable.id, id));
  res.sendStatus(204);
});

// ---- Partners ----

router.get("/admin/partners", async (_req, res): Promise<void> => {
  const partners = await db.select().from(partnersTable).orderBy(asc(partnersTable.createdAt));
  res.json(partners);
});

router.post("/admin/partners", async (req, res): Promise<void> => {
  const { name, email, phone, businessName, restaurantId, status, contractType, commissionRate, notes } = req.body;
  if (!name || !email || !businessName) {
    res.status(400).json({ error: "name, email, businessName are required" });
    return;
  }
  const [partner] = await db.insert(partnersTable).values({
    name,
    email,
    phone: phone ?? "",
    businessName,
    restaurantId: restaurantId ?? null,
    status: status ?? "pending",
    contractType: contractType ?? "standard",
    commissionRate: commissionRate ?? 15,
    notes: notes ?? "",
  }).returning();
  res.status(201).json(partner);
});

router.patch("/admin/partners/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { name, email, phone, businessName, restaurantId, status, contractType, commissionRate, notes } = req.body;
  const updates: Record<string, unknown> = {};
  if (name != null) updates.name = name;
  if (email != null) updates.email = email;
  if (phone != null) updates.phone = phone;
  if (businessName != null) updates.businessName = businessName;
  if (restaurantId !== undefined) updates.restaurantId = restaurantId;
  if (status != null) updates.status = status;
  if (contractType != null) updates.contractType = contractType;
  if (commissionRate != null) updates.commissionRate = commissionRate;
  if (notes != null) updates.notes = notes;
  const [partner] = await db.update(partnersTable).set(updates as Partial<typeof partnersTable.$inferInsert>).where(eq(partnersTable.id, id)).returning();
  if (!partner) { res.status(404).json({ error: "Partner not found" }); return; }
  res.json(partner);
});

router.delete("/admin/partners/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(partnersTable).where(eq(partnersTable.id, id));
  res.sendStatus(204);
});

// ---- Customers (users) ----

router.get("/admin/customers", async (_req, res): Promise<void> => {
  const customers = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(asc(usersTable.createdAt));
  res.json(customers);
});

// ---- Page Settings ----

router.get("/admin/landing/settings", async (_req, res): Promise<void> => {
  const settings = await db.select().from(pageSettingsTable);
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  res.json(map);
});

router.patch("/admin/landing/settings", async (req, res): Promise<void> => {
  const entries = Object.entries(req.body as Record<string, string>);
  for (const [key, value] of entries) {
    await db.insert(pageSettingsTable).values({ key, value }).onConflictDoUpdate({ target: pageSettingsTable.key, set: { value } });
  }
  const all = await db.select().from(pageSettingsTable);
  const map: Record<string, string> = {};
  for (const s of all) map[s.key] = s.value;
  res.json(map);
});

export default router;
