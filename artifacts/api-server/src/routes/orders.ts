import { Router, type IRouter } from "express";
import { db, ordersTable, menuItemsTable, restaurantsTable } from "@workspace/db";
import { eq, inArray, and, type SQL } from "drizzle-orm";
import {
  ListOrdersResponse,
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const conditions: SQL[] = [eq(ordersTable.userId, req.session.userId)];

  const orders = await db
    .select()
    .from(ordersTable)
    .where(and(...conditions))
    .orderBy(ordersTable.createdAt);

  const mapped = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));
  res.json(ListOrdersResponse.parse(mapped));
});

router.post("/orders", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "You must be logged in to place an order." });
    return;
  }
  if (req.session.userRole !== "customer") {
    res.status(403).json({ error: "Only customer accounts can place orders." });
    return;
  }

  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { restaurantId, items, deliveryAddress, customerName, customerPhone } = parsed.data;

  const [restaurant] = await db
    .select()
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, restaurantId));

  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }

  const menuItemIds = items.map((i) => i.menuItemId);
  const menuItems = await db
    .select()
    .from(menuItemsTable)
    .where(inArray(menuItemsTable.id, menuItemIds));

  const menuItemMap = new Map(menuItems.map((mi) => [mi.id, mi]));

  let totalAmount = 0;
  const orderItems = items.map((i) => {
    const menuItem = menuItemMap.get(i.menuItemId);
    if (!menuItem) throw new Error(`Menu item ${i.menuItemId} not found`);
    const lineTotal = menuItem.price * i.quantity;
    totalAmount += lineTotal;
    return {
      menuItemId: i.menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: i.quantity,
    };
  });

  const [order] = await db
    .insert(ordersTable)
    .values({
      userId: req.session.userId,
      restaurantId,
      restaurantName: restaurant.name,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      customerName,
      customerPhone,
      status: "pending",
      estimatedDelivery: "30-45 min",
    })
    .returning();

  res.status(201).json(GetOrderResponse.parse({
    ...order,
    createdAt: order.createdAt.toISOString(),
  }));
});

router.get("/orders/:orderId", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.orderId));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (req.session.userRole !== "admin" && order.userId !== req.session.userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  res.json(GetOrderResponse.parse({
    ...order,
    createdAt: order.createdAt.toISOString(),
  }));
});

export default router;
