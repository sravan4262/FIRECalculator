import { Hono } from "hono";
import { sql } from "../lib/supabase.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.js";
import type { AppVariables, DbPlan } from "../types.js";

const app = new Hono<{ Variables: AppVariables }>();

app.get("/", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const rows = await sql<DbPlan[]>`
    select * from plans where user_id = ${userId}::uuid order by updated_at
  `;
  return c.json(rows);
});

app.post("/", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<{ name: string; inputs: unknown }>();

  if (!body.name || !body.inputs) {
    return c.json({ error: "name and inputs are required" }, 400);
  }

  const [plan] = (await sql`
    insert into plans (user_id, name, inputs)
    values (${userId}::uuid, ${body.name}, ${sql.json(body.inputs as any)})
    returning *
  `) as DbPlan[];
  return c.json(plan, 201);
});

app.get("/:id", optionalAuthMiddleware, async (c) => {
  const userId = c.get("userId") as string | undefined;
  const id = c.req.param("id");
  if (!id) return c.json({ error: "Not found" }, 404);

  const [plan] = (await sql`
    select * from plans where id = ${id}::uuid
  `) as DbPlan[];
  if (!plan) return c.json({ error: "Not found" }, 404);

  if (!plan.is_public && plan.user_id !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }
  return c.json(plan);
});

app.put("/:id", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json<{ name?: string; inputs?: unknown; isPublic?: boolean }>();
  if (!id) return c.json({ error: "Not found" }, 404);

  const [plan] = (await sql`
    update plans
    set updated_at = now()
      ${body.name !== undefined ? sql`, name = ${body.name}` : sql``}
      ${body.inputs !== undefined ? sql`, inputs = ${sql.json(body.inputs as any)}` : sql``}
      ${body.isPublic !== undefined ? sql`, is_public = ${body.isPublic}` : sql``}
    where id = ${id}::uuid and user_id = ${userId}::uuid
    returning *
  `) as DbPlan[];
  if (!plan) return c.json({ error: "Not found" }, 404);
  return c.json(plan);
});

app.delete("/:id", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  if (!id) return c.json({ error: "Not found" }, 404);

  const [plan] = (await sql`
    delete from plans
    where id = ${id}::uuid and user_id = ${userId}::uuid
    returning *
  `) as DbPlan[];
  if (!plan) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});

export default app;

