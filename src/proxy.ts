import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

const PUBLIC_PAGES = ["/login"];
const PUBLIC_API = ["/api/auth", "/api/system/menus/sidebar"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // ---- Public Pages → ผ่านได้เลย ----
  if (PUBLIC_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  let payload: any = null;
  if (token) {
    try {
      payload = verifyToken(token);
    } catch (err: any) {}
  }

  // ---- ทุก Page (ไม่ใช่ API) ----
  if (!pathname.startsWith("/api/")) {
    // ไม่มี token → login
    if (!token || !payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    //  เช็คจาก path ใน token ไม่ต้องสนใจว่าขึ้นต้นด้วยอะไร
    const menuPerm = payload.permissions?.find((p: any) => p.path === pathname);

    // path นี้อยู่ใน menu → ตรวจ view
    if (menuPerm !== undefined) {
      const canView = menuPerm.permissions?.includes(1) ?? false;
      if (!canView) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
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
    res.headers.set("x-user-role", encodeURIComponent(payload.role));
    res.headers.set("x-user-roleId", String(payload.roleId));
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
