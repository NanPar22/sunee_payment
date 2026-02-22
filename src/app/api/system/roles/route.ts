import { NextRequest, NextResponse } from "next/server";
import { createRole, getRoleList } from "@/lib/role";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 10);
    const search = searchParams.get("search") || undefined;

    const statusParam = searchParams.get("status");
    const status = statusParam === null ? undefined : statusParam === "true";

    const result = await getRoleList({
      page,
      pageSize,
      search,
      status,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/roles error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const role = await createRole(body);

    return NextResponse.json(
      {
        success: true,
        data: role,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Create Role Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 400 },
    );
  }
}
