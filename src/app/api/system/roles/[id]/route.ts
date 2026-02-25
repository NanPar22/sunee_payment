import { NextRequest, NextResponse } from "next/server";
import { updateRole, deleteRole,} from "@/lib/role";

// ================= PUT =================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params; // ✅ ต้อง await
    const roleId = Number(id);

    if (isNaN(roleId) || roleId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid role ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { roleCode, roleName, description, isstatus } = body;

    const role = await updateRole(roleId, {
      roleCode,
      roleName,
      description,
      isstatus,
    });

    return NextResponse.json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message ?? "Failed to update role",
      },
      { status: 500 },
    );
  }
}

// ================= DELETE =================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params; // ✅ ต้อง await
    const roleId = Number(id);

    if (isNaN(roleId) || roleId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid role ID" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const hard = searchParams.get("hard") === "true";

    if (hard) {
      await deleteRole(roleId);
    } else {
      await deleteRole(roleId);
    }

    return NextResponse.json({
      success: true,
      message: hard ? "Role permanently deleted" : "Role disabled successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message ?? "Failed to delete role",
      },
      { status: 500 },
    );
  }
}
