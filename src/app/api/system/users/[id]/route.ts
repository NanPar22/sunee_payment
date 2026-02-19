import { NextRequest, NextResponse } from "next/server";
import { updateUser, deleteUser } from "@/lib/user";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const userId = Number(id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { spid, username, roleId, status } = body;

    const result = await updateUser(userId, {
      spid,
      username,
      roleId,
      status,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params; // ✅ ต้อง await
    const userId = Number(id);
    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid id" },
        { status: 400 },
      );
    }

    const result = await deleteUser(userId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
