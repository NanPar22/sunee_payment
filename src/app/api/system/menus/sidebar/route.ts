import { getSidebarMenuByRole } from "@/lib/menu";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const payload = verifyToken(token);
    const data = await getSidebarMenuByRole(payload.roleId); // ✅ กรองตาม role

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Menu Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sidebar menu" },
      { status: 500 }
    );
  }
}