import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import { trackerEntries, trackerCategories } from "@fire/db/schema";
import { authMiddleware } from "../middleware/auth";

const app = new Hono();

// All tracker routes require auth
app.use("*", authMiddleware);

// GET /tracker/entries?month=YYYY-MM
app.get("/entries", async (c) => {
  const userId = c.get("userId") as string;
  const month = c.req.query("month");

  const rows = month
    ? await db
        .select()
        .from(trackerEntries)
        .where(and(eq(trackerEntries.userId, userId), eq(trackerEntries.month, month)))
    : await db
        .select()
        .from(trackerEntries)
        .where(eq(trackerEntries.userId, userId));

  return c.json(rows);
});

// PUT /tracker/entries — upsert a batch of entries
app.put("/entries", async (c) => {
  const userId = c.get("userId") as string;
  const body = await c.req.json<
    Array<{ month: string; categoryId: string; planned?: number; actual?: number }>
  >();

  if (!Array.isArray(body) || body.length === 0) {
    return c.json({ error: "Body must be a non-empty array" }, 400);
  }

  const rows = await db
    .insert(trackerEntries)
    .values(
      body.map((e) => ({
        userId,
        month: e.month,
        categoryId: e.categoryId,
        planned: e.planned?.toString(),
        actual: e.actual?.toString(),
      }))
    )
    .onConflictDoUpdate({
      target: [trackerEntries.userId, trackerEntries.month, trackerEntries.categoryId],
      set: {
        planned: trackerEntries.planned,
        actual: trackerEntries.actual,
      },
    })
    .returning();

  return c.json(rows);
});

// GET /tracker/categories
app.get("/categories", async (c) => {
  const userId = c.get("userId") as string;
  const rows = await db
    .select()
    .from(trackerCategories)
    .where(eq(trackerCategories.userId, userId))
    .orderBy(trackerCategories.sortOrder);
  return c.json(rows);
});

// POST /tracker/categories
app.post("/categories", async (c) => {
  const userId = c.get("userId") as string;
  const body = await c.req.json<{ label: string; color: string }>();

  if (!body.label || !body.color) {
    return c.json({ error: "label and color are required" }, 400);
  }

  const [row] = await db
    .insert(trackerCategories)
    .values({ userId, label: body.label, color: body.color })
    .returning();

  return c.json(row, 201);
});

// DELETE /tracker/categories/:id
app.delete("/categories/:id", async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");

  const [row] = await db
    .delete(trackerCategories)
    .where(and(eq(trackerCategories.id, id), eq(trackerCategories.userId, userId)))
    .returning();

  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});

export default app;
