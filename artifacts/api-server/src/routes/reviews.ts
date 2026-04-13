import { Router, type IRouter } from "express";
import { db, reviewsTable, restaurantsTable, usersTable, partnersTable } from "@workspace/db";
import { eq, desc, avg, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/restaurants/:restaurantId/reviews", async (req, res): Promise<void> => {
  const restaurantId = parseInt(req.params.restaurantId);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurant id" }); return; }

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.restaurantId, restaurantId))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(50);

  res.json(reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/restaurants/:restaurantId/reviews", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Must be logged in to leave a review" });
    return;
  }

  const restaurantId = parseInt(req.params.restaurantId);
  if (isNaN(restaurantId)) { res.status(400).json({ error: "Invalid restaurant id" }); return; }

  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, restaurantId));
  if (!restaurant) { res.status(404).json({ error: "Restaurant not found" }); return; }

  const { rating, comment = "", orderId } = req.body ?? {};
  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    res.status(400).json({ error: "Rating must be between 1 and 5" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
  const customerName = user?.name ?? "Anonymous";

  const [review] = await db
    .insert(reviewsTable)
    .values({
      restaurantId,
      userId: req.session.userId,
      orderId: orderId ? parseInt(orderId) : null,
      customerName,
      rating: ratingNum,
      comment: String(comment).slice(0, 1000),
    })
    .returning();

  const [stats] = await db
    .select({ avgRating: avg(reviewsTable.rating), total: count() })
    .from(reviewsTable)
    .where(eq(reviewsTable.restaurantId, restaurantId));

  const newRating = parseFloat((parseFloat(String(stats?.avgRating ?? "0")) || 0).toFixed(1));
  const newCount = Number(stats?.total ?? 0);

  await db
    .update(restaurantsTable)
    .set({ rating: newRating, reviewCount: newCount })
    .where(eq(restaurantsTable.id, restaurantId));

  res.status(201).json({ ...review, createdAt: review.createdAt.toISOString() });
});

router.get("/partner/:partnerId/reviews", async (req, res): Promise<void> => {
  const isAdmin = req.session.userId && req.session.userRole === "admin";
  const partnerId = parseInt(req.params.partnerId);
  const isOwn = req.session.partnerId === partnerId;
  if (!isAdmin && !isOwn) {
    res.status(403).json({ error: "Access denied" });
    return;
  }
  if (isNaN(partnerId)) { res.status(400).json({ error: "Invalid partner id" }); return; }

  const [partner] = await db.select().from(partnersTable).where(eq(partnersTable.id, partnerId));
  if (!partner?.restaurantId) { res.json([]); return; }

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.restaurantId, partner.restaurantId))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(100);

  res.json(reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

export default router;
