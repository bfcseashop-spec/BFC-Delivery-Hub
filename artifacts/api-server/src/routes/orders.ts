import { Router, type IRouter } from "express";
import { db, ordersTable, menuItemsTable, restaurantsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import {
  ListOrdersResponse,
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  const mapped = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));
  res.json(ListOrdersResponse.parse(mapped));
});

router.post("/orders", async (req, res): Promise<void> => {
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

  res.json(GetOrderResponse.parse({
    ...order,
    createdAt: order.createdAt.toISOString(),
  }));
});

export default router;
