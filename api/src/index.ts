import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import plansRouter from "./routes/plans";
import trackerRouter from "./routes/tracker";
import internalRouter from "./routes/internal";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.UI_ORIGIN ?? "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.route("/plans", plansRouter);
app.route("/tracker", trackerRouter);
app.route("/internal", internalRouter);

app.get("/", (c) => c.json({ name: "@fire/api", status: "ok" }));

const port = Number(process.env.PORT ?? 4000);
serve({ fetch: app.fetch, port }, () => {
  console.log(`api running on http://localhost:${port}`);
});

export default app;
