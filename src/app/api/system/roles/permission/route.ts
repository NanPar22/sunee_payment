import { getAllPermissionByRole, upsertPermissionBulk } from "@/lib/permision";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = parseInt(searchParams.get("roleId") ?? "");

    if (isNaN(roleId)) {
      return NextResponse.json({ message: "Invalid roleId" }, { status: 400 });
    }

    const permissions = await getAllPermissionByRole(roleId);
    return NextResponse.json(permissions);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roleId, permissions } = body;

    if (!roleId || !Array.isArray(permissions)) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const result = await upsertPermissionBulk(roleId, permissions);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
