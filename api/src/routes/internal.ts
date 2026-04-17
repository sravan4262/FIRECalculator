import { Hono } from "hono";
import { internalMiddleware } from "../middleware/internal.js";
import { sql } from "../lib/supabase.js";

const app = new Hono();

app.use("*", internalMiddleware);

app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }));

app.get("/metrics", async (c) => {
  const [{ count: planCount }] = await sql<[{ count: string }]>`SELECT count(*) FROM plans`;
  const [{ count: entryCount }] = await sql<[{ count: string }]>`SELECT count(*) FROM tracker_entries`;
  return c.json({ plans: Number(planCount), trackerEntries: Number(entryCount) });
});

export default app;
