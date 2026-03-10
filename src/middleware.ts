import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export const runtime = "nodejs";

const PUBLIC_API = ["/api/auth", "/api/system/menus/sidebar"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  let payload: any = null;
  if (token) {
    try {
      payload = verifyToken(token);
    } catch (err: any) {
    }
  }

  // ---- Protected Pages ----
  if (pathname.startsWith("/report")) {
    if (!token || !payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ---- API Routes ----
  const isPublic = PUBLIC_API.some((p) => pathname.startsWith(p));
  if (pathname.startsWith("/api/") && !isPublic) {
    if (!token || !payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const res = NextResponse.next();
    res.headers.set("x-user-id", String(payload.id));
    res.headers.set("x-user-role", encodeURIComponent(payload.role)); // ✅ encode
    res.headers.set("x-user-roleId", String(payload.roleId));
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/report/:path*", "/api/:path*"],
};
