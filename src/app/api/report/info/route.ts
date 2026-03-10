import { NextResponse } from "next/server";
import { getReportInfo } from "@/lib/report";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt"; // ✅ เปลี่ยนมาใช้ verifyToken

export async function GET(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ ใช้ verifyToken แทน jwt.verify ตรงๆ
    const payload = verifyToken(token);

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize") ?? 10)),
    );
    const search = searchParams.get("search") || undefined;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const dateFrom = from ? new Date(from) : undefined;
    const dateTo = to ? new Date(to) : undefined;

    const result = await getReportInfo({
      page,
      pageSize,
      search,
      dateFrom,
      dateTo,
      spid: payload.spid, // ✅ ส่งไป filter salesman
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
