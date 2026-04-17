import { Hono } from "hono";
import { supabaseAdmin } from "../lib/supabase.js";
import { authMiddleware } from "../middleware/auth.js";
import type { AppVariables, DbTrackerCategory, DbTrackerEntry } from "../types.js";

const app = new Hono<{ Variables: AppVariables }>();

app.use("*", authMiddleware);

app.get("/entries", async (c) => {
  const userId = c.get("userId");
  const month = c.req.query("month");

  let query = supabaseAdmin.from("tracker_entries").select("*").eq("user_id", userId);
  if (month) query = query.eq("month", month);

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data as DbTrackerEntry[]);
});

app.put("/entries", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<
    Array<{ month: string; categoryId: string; planned?: number; actual?: number }>
  >();

  if (!Array.isArray(body) || body.length === 0) {
    return c.json({ error: "Body must be a non-empty array" }, 400);
  }

  const { data, error } = await supabaseAdmin
    .from("tracker_entries")
    .upsert(
      body.map((e) => ({
        user_id: userId,
        month: e.month,
        category_id: e.categoryId,
        ...(e.planned !== undefined && { planned: e.planned }),
        ...(e.actual !== undefined && { actual: e.actual }),
      })),
      { onConflict: "user_id,month,category_id" }
    )
    .select();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data as DbTrackerEntry[]);
});

app.get("/categories", async (c) => {
  const userId = c.get("userId");
  const { data, error } = await supabaseAdmin
    .from("tracker_categories")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data as DbTrackerCategory[]);
});

app.post("/categories", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<{ label: string; color: string }>();

  if (!body.label || !body.color) {
    return c.json({ error: "label and color are required" }, 400);
  }

  const { data: existing } = await supabaseAdmin
    .from("tracker_categories")
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = existing ? (existing.sort_order as number) + 1 : 0;

  const { data, error } = await supabaseAdmin
    .from("tracker_categories")
    .insert({ user_id: userId, label: body.label, color: body.color, sort_order: sortOrder })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data as DbTrackerCategory, 201);
});

app.delete("/categories/:id", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const { data, error } = await supabaseAdmin
    .from("tracker_categories")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});

export default app;
