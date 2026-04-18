import { NextResponse, type NextRequest } from "next/server";

async function getUser(request: NextRequest): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return false;

  // Extract the Supabase access token from cookies
  const cookies = request.cookies.getAll();
  const tokenCookie = cookies.find(
    (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
  );
  if (!tokenCookie) return false;

  try {
    const parsed = JSON.parse(decodeURIComponent(tokenCookie.value));
    const accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
    if (!accessToken) return false;

    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseAnonKey,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");
  const isPublicPlan = pathname.startsWith("/plan/");

  if (isAuthPage || isPublicPlan || pathname === "/") {
    return NextResponse.next({ request });
  }

  const isLoggedIn = await getUser(request);
  if (!isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url, { status: 302 });
  }

  return NextResponse.next({ request });
}
