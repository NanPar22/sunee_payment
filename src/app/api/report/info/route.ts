import { NextResponse } from "next/server";
import { getReport } from "@/lib/report";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    // 🔐 อ่าน token จาก cookie
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: number;
      username: string;
      role: string;
      spid?: string;
    };

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize") ?? 10))
    );

    const search = searchParams.get("search") || undefined;

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFrom = from ? new Date(from) : undefined;
    const dateTo = to ? new Date(to) : undefined;

    const result = await getReport({
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
      { status: 500 }
    );
  }
}
