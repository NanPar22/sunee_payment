import { NextResponse } from "next/server";
import { getReport } from "@/lib/report";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // pagination
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize") ?? 10))
    );

    // 🔍 search
    const search = searchParams.get("search") || undefined;

    // 📅 date from / to (แปลง string -> Date)
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
