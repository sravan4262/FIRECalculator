import { Hono } from "hono";
import { internalMiddleware } from "../middleware/internal.js";
import { supabaseAdmin } from "../lib/supabase.js";

const app = new Hono();

app.use("*", internalMiddleware);

app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }));

app.get("/metrics", async (c) => {
  const [{ count: planCount }, { count: entryCount }] = await Promise.all([
    supabaseAdmin.from("plans").select("*", { count: "exact", head: true }).then((r) => ({ count: r.count ?? 0 })),
    supabaseAdmin.from("tracker_entries").select("*", { count: "exact", head: true }).then((r) => ({ count: r.count ?? 0 })),
  ]);

  return c.json({ plans: planCount, trackerEntries: entryCount });
});

export default app;
