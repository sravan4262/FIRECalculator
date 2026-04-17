import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import { plans } from "@fire/db/schema";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";

const app = new Hono();

// GET /plans — list authed user's plans
app.get("/", authMiddleware, async (c) => {
  const userId = c.get("userId") as string;
  const rows = await db
    .select()
    .from(plans)
    .where(eq(plans.userId, userId))
    .orderBy(plans.updatedAt);
  return c.json(rows);
});

// POST /plans — create a plan
app.post("/", authMiddleware, async (c) => {
  const userId = c.get("userId") as string;
  const body = await c.req.json<{ name: string; inputs: unknown }>();

  if (!body.name || !body.inputs) {
    return c.json({ error: "name and inputs are required" }, 400);
  }

  const [row] = await db
    .insert(plans)
    .values({ userId, name: body.name, inputs: body.inputs })
    .returning();

  return c.json(row, 201);
});

// GET /plans/:id — get a single plan (public plans readable without auth)
app.get("/:id", optionalAuthMiddleware, async (c) => {
  const userId = c.get("userId") as string | undefined;
  const id = c.req.param("id");

  const [row] = await db.select().from(plans).where(eq(plans.id, id));

  if (!row) return c.json({ error: "Not found" }, 404);

  if (!row.isPublic && row.userId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json(row);
});

// PUT /plans/:id — update name or inputs
app.put("/:id", authMiddleware, async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");
  const body = await c.req.json<{ name?: string; inputs?: unknown; isPublic?: boolean }>();

  const [row] = await db
    .update(plans)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.inputs !== undefined && { inputs: body.inputs }),
      ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
      updatedAt: new Date(),
    })
    .where(and(eq(plans.id, id), eq(plans.userId, userId)))
    .returning();

  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

// DELETE /plans/:id
app.delete("/:id", authMiddleware, async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");

  const [row] = await db
    .delete(plans)
    .where(and(eq(plans.id, id), eq(plans.userId, userId)))
    .returning();

  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});

export default app;
