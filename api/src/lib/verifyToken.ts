import { jwtVerify, createRemoteJWKSet } from "jose";

export async function verifyToken(token: string | undefined): Promise<string | null> {
  // ── Local dev bypass ──────────────────────────────────────────────────────
  const devUserId = process.env.DEV_USER_ID;
  if (devUserId) return devUserId;

  // ── Supabase JWT verification ─────────────────────────────────────────────
  if (!token) return null;

  const supabaseUrl = process.env.SUPABASE_URL;
  const jwtSecret = process.env.SUPABASE_JWT_SECRET;

  if (!supabaseUrl && !jwtSecret) {
    throw new Error("Either SUPABASE_URL (JWKS) or SUPABASE_JWT_SECRET (symmetric) must be set");
  }

  try {
    if (supabaseUrl) {
      // New Supabase CLI (v2.84+): asymmetric RS256 — verify via JWKS endpoint
      const JWKS = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
      const { payload } = await jwtVerify(token, JWKS);
      return (payload.sub as string) ?? null;
    } else {
      // Legacy / self-hosted: symmetric HS256
      const secret = new TextEncoder().encode(jwtSecret!);
      const { payload } = await jwtVerify(token, secret);
      return (payload.sub as string) ?? null;
    }
  } catch {
    return null;
  }
}
