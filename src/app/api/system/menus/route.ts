import { NextRequest, NextResponse } from "next/server";
import { getMenuList } from "@/lib/menu";

export const dynamic = "force-dynamic"; // กัน cache

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const search = searchParams.get("search") ?? undefined;
    const statusParam = searchParams.get("status");

    // แปลง string → boolean
    let status: boolean | undefined = undefined;
    if (statusParam === "true") status = true;
    if (statusParam === "false") status = false;

    const result = await getMenuList({
      page,
      pageSize,
      search,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Menu API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

