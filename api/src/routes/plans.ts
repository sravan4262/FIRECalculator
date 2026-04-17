import { Hono } from "hono";
import { supabaseAdmin } from "../lib/supabase.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.js";
import type { AppVariables, DbPlan } from "../types.js";

const app = new Hono<{ Variables: AppVariables }>();

app.get("/", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const { data, error } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data as DbPlan[]);
});

app.post("/", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<{ name: string; inputs: unknown }>();

  if (!body.name || !body.inputs) {
    return c.json({ error: "name and inputs are required" }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from("plans")
    .insert({ user_id: userId, name: body.name, inputs: body.inputs })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data as DbPlan, 201);
});

app.get("/:id", optionalAuthMiddleware, async (c) => {
  const userId = c.get("userId") as string | undefined;
  const id = c.req.param("id");

  const { data, error } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return c.json({ error: "Not found" }, 404);

  const plan = data as DbPlan;
  if (!plan.is_public && plan.user_id !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json(plan);
});

app.put("/:id", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const body = await c.req.json<{ name?: string; inputs?: unknown; isPublic?: boolean }>();

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) patch.name = body.name;
  if (body.inputs !== undefined) patch.inputs = body.inputs;
  if (body.isPublic !== undefined) patch.is_public = body.isPublic;

  const { data, error } = await supabaseAdmin
    .from("plans")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) return c.json({ error: "Not found" }, 404);
  return c.json(data as DbPlan);
});

app.delete("/:id", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const { data, error } = await supabaseAdmin
    .from("plans")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});

export default app;
