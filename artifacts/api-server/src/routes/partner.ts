import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, partnersTable, restaurantsTable, ordersTable, menuItemsTable } from "@workspace/db";
import { eq, and, desc, gte, sql } from "drizzle-orm";

const router: IRouter = Router();

function requireAdminOrSelf(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId || req.session.userRole !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

router.use("/partner", requireAdminOrSelf as Parameters<typeof router.use>[0]);

router.get("/partner/:partnerId", async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner) { res.status(404).json({ error: "Partner not found" }); return; }
  let restaurant = null;
  if (partner.restaurantId) {
    const [r] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, partner.restaurantId));
    restaurant = r ?? null;
  }
  res.json({ partner, restaurant });
});

router.get("/partner/:partnerId/stats", async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.json({ totalOrders: 0, totalRevenue: 0, avgOrderValue: 0, pendingOrders: 0, completedOrders: 0, commissionOwed: 0 }); return; }

  const orders = await db.select().from(ordersTable).where(eq(ordersTable.restaurantId, partner.restaurantId));
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = orders.filter(o => ["pending", "confirmed", "preparing", "out_for_delivery"].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === "delivered").length;
  const commissionOwed = totalRevenue * (partner.commissionRate / 100);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dailyMap: Record<string, { orders: number; revenue: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = { orders: 0, revenue: 0 };
  }
  for (const o of orders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (dailyMap[key]) { dailyMap[key].orders++; dailyMap[key].revenue += o.total; }
  }
  const daily = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }));

  res.json({ totalOrders, totalRevenue, avgOrderValue, pendingOrders, completedOrders, commissionOwed, daily });
});

router.get("/partner/:partnerId/orders", async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.json([]); return; }
  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.restaurantId, partner.restaurantId))
    .orderBy(desc(ordersTable.createdAt));
  res.json(orders);
});

router.get("/partner/:partnerId/menu", async (req, res): Promise<void> => {
  const id = parseInt(req.params.partnerId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, id));
  if (!partner?.restaurantId) { res.json([]); return; }
  const items = await db.select().from(menuItemsTable)
    .where(eq(menuItemsTable.restaurantId, partner.restaurantId));
  res.json(items);
});

router.get("/partner/:partnerId/invoices", async (req, res): Promise<void> => {
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
    monthMap[key].revenue += o.total;
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
