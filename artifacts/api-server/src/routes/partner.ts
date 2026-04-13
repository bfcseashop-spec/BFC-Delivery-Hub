import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, partnersTable, restaurantsTable, ordersTable, menuItemsTable, restaurantCategoriesTable, menuItemOptionsTable } from "@workspace/db";
import { eq, and, desc, asc } from "drizzle-orm";
import bcrypt from "bcrypt";

const router: IRouter = Router();

function requireAdminOrPartner(req: Request, res: Response, next: NextFunction): void {
  const isAdmin = req.session.userId && req.session.userRole === "admin";
  const isPartner = !!req.session.partnerId;
  if (!isAdmin && !isPartner) {
    res.status(403).json({ error: "Authentication required" });
    return;
  }
  next();
}

function requireOwnOrAdmin(req: Request, res: Response, next: NextFunction): void {
  const isAdmin = req.session.userId && req.session.userRole === "admin";
  const partnerId = parseInt(req.params.partnerId);
  const isOwnSession = req.session.partnerId === partnerId;
  if (!isAdmin && !isOwnSession) {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  next();
}

/* ── Partner Auth ─────────────────────────────────────────────── */

router.post("/partner/login", async (req, res): Promise<void> => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.username, username.trim()));
  if (!partner || !partner.passwordHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const match = await bcrypt.compare(password, partner.passwordHash);
  if (!match) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (partner.status === "suspended") {
    res.status(403).json({ error: "Your account has been suspended. Contact support." });
    return;
  }
  req.session.partnerId = partner.id;
  delete req.session.userId;
  delete req.session.userRole;
  res.json({ ok: true, partnerId: partner.id, businessName: partner.businessName });
});

router.post("/partner/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/partner/me", async (req, res): Promise<void> => {
  const isAdmin = req.session.userId && req.session.userRole === "admin";
  const pid = req.session.partnerId;
  if (!isAdmin && !pid) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (isAdmin) {
    res.json({ role: "admin" });
    return;
  }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, pid!));
  if (!partner) { res.status(404).json({ error: "Partner not found" }); return; }
  res.json({ role: "partner", partnerId: partner.id, businessName: partner.businessName, name: partner.name });
});

/* ── Partner Data Routes (admin or own session) ───────────────── */

router.get("/partner/:partnerId", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner) { res.status(404).json({ error: "Partner not found" }); return; }
  let restaurant = null;
  if (partner.restaurantId) {
    const [r] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, partner.restaurantId));
    restaurant = r ?? null;
  }
  const { passwordHash, ...safePartner } = partner;
  res.json({ partner: safePartner, restaurant });
});

router.get("/partner/:partnerId/stats", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.json({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0, pendingOrders: 0, completedOrders: 0, commissionOwed: 0, daily: [] }); return; }

  const orders = await db.select().from(ordersTable).where(eq(ordersTable.restaurantId, partner.restaurantId));
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = orders.filter(o => ["pending", "confirmed", "preparing", "out_for_delivery"].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === "delivered").length;
  const commissionOwed = totalRevenue * (partner.commissionRate / 100);

  const now = new Date();
  const dailyMap: Record<string, { orders: number; revenue: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = { orders: 0, revenue: 0 };
  }
  for (const o of orders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (dailyMap[key]) { dailyMap[key].orders++; dailyMap[key].revenue += o.totalAmount; }
  }
  const daily = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }));

  res.json({ totalOrders, totalRevenue, avgOrderValue, pendingOrders, completedOrders, commissionOwed, daily });
});

router.get("/partner/:partnerId/orders", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.json([]); return; }
  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.restaurantId, partner.restaurantId))
    .orderBy(desc(ordersTable.createdAt));
  res.json(orders);
});

/* ── Partner Menu Routes ─────────────────────────────────────── */

// GET flat list (legacy)
router.get("/partner/:partnerId/menu", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.json([]); return; }
  const items = await db.select().from(menuItemsTable).where(eq(menuItemsTable.restaurantId, partner.restaurantId));
  res.json(items);
});

// GET grouped by category
router.get("/partner/:partnerId/menu/grouped", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.json([]); return; }
  const items = await db.select().from(menuItemsTable).where(eq(menuItemsTable.restaurantId, partner.restaurantId));
  const sectionMap: Record<string, typeof items> = {};
  for (const item of items) {
    const cat = item.category || "Uncategorized";
    if (!sectionMap[cat]) sectionMap[cat] = [];
    sectionMap[cat].push(item);
  }
  const sections = Object.entries(sectionMap).map(([category, items]) => ({ category, items }));
  res.json(sections);
});

// POST create menu item
router.post("/partner/:partnerId/menu/items", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.status(400).json({ error: "Partner has no restaurant" }); return; }
  const { name, description, price, category, imageUrl, images, isAvailable, isPopular } = req.body;
  if (!name?.trim()) { res.status(400).json({ error: "Name is required" }); return; }
  const [item] = await db.insert(menuItemsTable).values({
    restaurantId: partner.restaurantId,
    name: name.trim(),
    description: description ?? "",
    price: parseFloat(price) || 0,
    category: category ?? "",
    imageUrl: imageUrl ?? "",
    images: images ?? "[]",
    isAvailable: isAvailable ?? true,
    isPopular: isPopular ?? false,
  }).returning();
  res.status(201).json(item);
});

// PATCH update menu item
router.patch("/partner/:partnerId/menu/items/:itemId", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  const itemId = parseInt(req.params.itemId);
  if (isNaN(id) || isNaN(itemId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.status(400).json({ error: "Partner has no restaurant" }); return; }
  const { name, description, price, category, imageUrl, images, isAvailable, isPopular } = req.body;
  const updates: Partial<typeof menuItemsTable.$inferInsert> = {};
  if (name != null) updates.name = name;
  if (description != null) updates.description = description;
  if (price != null) updates.price = parseFloat(price) || 0;
  if (category != null) updates.category = category;
  if (imageUrl != null) updates.imageUrl = imageUrl;
  if (images != null) updates.images = images;
  if (isAvailable != null) updates.isAvailable = isAvailable;
  if (isPopular != null) updates.isPopular = isPopular;
  const [item] = await db.update(menuItemsTable).set(updates)
    .where(and(eq(menuItemsTable.id, itemId), eq(menuItemsTable.restaurantId, partner.restaurantId)))
    .returning();
  if (!item) { res.status(404).json({ error: "Item not found" }); return; }
  res.json(item);
});

// DELETE menu item
router.delete("/partner/:partnerId/menu/items/:itemId", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  const itemId = parseInt(req.params.itemId);
  if (isNaN(id) || isNaN(itemId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.status(400).json({ error: "Partner has no restaurant" }); return; }
  await db.delete(menuItemsTable)
    .where(and(eq(menuItemsTable.id, itemId), eq(menuItemsTable.restaurantId, partner.restaurantId)));
  res.sendStatus(204);
});

/* ── Partner Category Routes ─────────────────────────────────── */

router.get("/partner/:partnerId/categories", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.json([]); return; }
  const rows = await db.select().from(restaurantCategoriesTable)
    .where(eq(restaurantCategoriesTable.restaurantId, partner.restaurantId))
    .orderBy(asc(restaurantCategoriesTable.displayOrder), asc(restaurantCategoriesTable.name));
  res.json(rows);
});

router.post("/partner/:partnerId/categories", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.status(400).json({ error: "Partner has no restaurant" }); return; }
  const { name } = req.body as { name: string };
  if (!name?.trim()) { res.status(400).json({ error: "Category name is required" }); return; }
  const existing = await db.select().from(restaurantCategoriesTable)
    .where(and(eq(restaurantCategoriesTable.restaurantId, partner.restaurantId), eq(restaurantCategoriesTable.name, name.trim())));
  if (existing.length > 0) { res.status(409).json({ error: "Category already exists" }); return; }
  const all = await db.select().from(restaurantCategoriesTable)
    .where(eq(restaurantCategoriesTable.restaurantId, partner.restaurantId));
  const [row] = await db.insert(restaurantCategoriesTable).values({
    restaurantId: partner.restaurantId, name: name.trim(), displayOrder: all.length,
  }).returning();
  res.status(201).json(row);
});

router.delete("/partner/:partnerId/categories/:categoryId", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  const categoryId = parseInt(req.params.categoryId);
  if (isNaN(id) || isNaN(categoryId)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.status(400).json({ error: "Partner has no restaurant" }); return; }
  await db.delete(restaurantCategoriesTable)
    .where(and(eq(restaurantCategoriesTable.id, categoryId), eq(restaurantCategoriesTable.restaurantId, partner.restaurantId)));
  res.sendStatus(204);
});

/* ── Partner Menu Item Options Routes ────────────────────────── */

router.get("/partner/:partnerId/menu/items/:itemId/options", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const itemId = parseInt(req.params.itemId);
  if (isNaN(itemId)) { res.status(400).json({ error: "Invalid itemId" }); return; }
  const rows = await db.select().from(menuItemOptionsTable)
    .where(eq(menuItemOptionsTable.menuItemId, itemId))
    .orderBy(asc(menuItemOptionsTable.displayOrder));
  res.json(rows);
});

router.post("/partner/:partnerId/menu/items/:itemId/options", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const itemId = parseInt(req.params.itemId);
  if (isNaN(itemId)) { res.status(400).json({ error: "Invalid itemId" }); return; }
  const { name, price } = req.body as { name: string; price: number };
  if (!name?.trim()) { res.status(400).json({ error: "Option name is required" }); return; }
  const existing = await db.select().from(menuItemOptionsTable)
    .where(eq(menuItemOptionsTable.menuItemId, itemId))
    .orderBy(asc(menuItemOptionsTable.displayOrder));
  const [row] = await db.insert(menuItemOptionsTable).values({
    menuItemId: itemId, name: name.trim(), price: Number(price) || 0, displayOrder: existing.length,
  }).returning();
  res.status(201).json(row);
});

router.delete("/partner/:partnerId/menu-item-options/:optionId", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const optionId = parseInt(req.params.optionId);
  if (isNaN(optionId)) { res.status(400).json({ error: "Invalid optionId" }); return; }
  await db.delete(menuItemOptionsTable).where(eq(menuItemOptionsTable.id, optionId));
  res.sendStatus(204);
});

/* ── Invoices ─────────────────────────────────────────────────── */

router.get("/partner/:partnerId/invoices", requireOwnOrAdmin as Parameters<typeof router.use>[0], async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.json([]); return; }

  const orders = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.restaurantId, partner.restaurantId), eq(ordersTable.status, "delivered")));

  const monthMap: Record<string, { revenue: number; orderCount: number }> = {};
  for (const o of orders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 7);
    if (!monthMap[key]) monthMap[key] = { revenue: 0, orderCount: 0 };
    monthMap[key].revenue += o.totalAmount;
    monthMap[key].orderCount++;
  }
  const invoices = Object.entries(monthMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, v], i) => ({
      id: i + 1,
      month,
      revenue: v.revenue,
      orderCount: v.orderCount,
      commission: v.revenue * (partner.commissionRate / 100),
      status: i === 0 ? "pending" : "paid",
    }));
  res.json(invoices);
});

export default router;
