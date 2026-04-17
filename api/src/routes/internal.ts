import { Hono } from "hono";
import { internalMiddleware } from "../middleware/internal";
import { db } from "../lib/db";
import { plans, trackerEntries } from "@fire/db/schema";
import { count } from "drizzle-orm";

const app = new Hono();

app.use("*", internalMiddleware);

app.get("/health", (c) => c.json({ status: "ok", ts: new Date().toISOString() }));

app.get("/metrics", async (c) => {
  const [planCount] = await db.select({ count: count() }).from(plans);
  const [entryCount] = await db.select({ count: count() }).from(trackerEntries);
  return c.json({ plans: planCount.count, trackerEntries: entryCount.count });
});

export default app;
