import { NextRequest, NextResponse } from "next/server";
import { getUsers, createUser } from "@/lib/user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const search = searchParams.get("search") ?? undefined;
    const role = searchParams.get("role") ?? undefined;
    const statusParam = searchParams.get("status");
    const status = statusParam === null ? undefined : statusParam === "true";

    const result = await getUsers({ page, pageSize, search, status, role });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spid, username, roleId, status } = body;

    if (!spid || !username || !roleId) {
      return NextResponse.json(
        { success: false, message: "spid, username, roleId are required" },
        { status: 400 },
      );
    }

    const result = await createUser({ spid, username, roleId, status });
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
