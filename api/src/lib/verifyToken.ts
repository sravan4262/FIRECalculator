import { jwtVerify } from "jose";

/**
 * Returns the userId for the request.
 *
 * LOCAL mode  (DEV_USER_ID is set):
 *   Always returns DEV_USER_ID — no token required.
 *   Set this in api/.env.local for local postgres dev.
 *
 * SUPABASE mode (SUPABASE_JWT_SECRET is set):
 *   Verifies the Supabase-issued JWT and returns the `sub` claim.
 *   Set this in api/.env for production / Supabase deployments.
 */
export async function verifyToken(token: string | undefined): Promise<string | null> {
  // ── Local dev bypass ──────────────────────────────────────────────────────
  const devUserId = process.env.DEV_USER_ID;
  if (devUserId) return devUserId;

  // ── Supabase JWT verification ─────────────────────────────────────────────
  if (!token) return null;

  const jwtSecret = process.env.SUPABASE_JWT_SECRET;
  if (!jwtSecret) {
    throw new Error(
      "Either DEV_USER_ID (local) or SUPABASE_JWT_SECRET (supabase) must be set"
    );
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}
