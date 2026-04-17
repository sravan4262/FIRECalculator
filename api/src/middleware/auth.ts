import type { Context, Next } from "hono";
import { supabaseAdmin } from "../lib/supabase.js";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return c.json({ error: "Invalid token" }, 401);
  }

  c.set("userId", data.user.id);
  c.set("user", data.user);
  await next();
}

// Optional auth — sets userId if token present, doesn't block if missing
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data } = await supabaseAdmin.auth.getUser(token);
    if (data.user) {
      c.set("userId", data.user.id);
      c.set("user", data.user);
    }
  }
  await next();
}
