import { NextRequest, NextResponse } from "next/server";
import {
  getRoleWithPermissions,
  updateRole,
  deleteRole,
  hardDeleteRole,
} from "@/lib/role";

// GET - ดึงข้อมูล role
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const roleId = parseInt(params.id);

    if (isNaN(roleId)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
    }

    const role = await getRoleWithPermissions(roleId);

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json(
      { error: "Failed to fetch role" },
      { status: 500 },
    );
  }
}

// PUT - อัพเดท role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const roleId = parseInt(params.id);

    if (isNaN(roleId)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
    }

    const body = await request.json();
    const { roleCode, roleName, description, isstatus } = body;

    const role = await updateRole(roleId, {
      roleCode,
      roleName,
      description,
      isstatus,
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 },
    );
  }
}

// DELETE - ลบ role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const roleId = parseInt(params.id);

    if (isNaN(roleId)) {
      return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
    }

    // ตรวจสอบว่าต้องการ soft delete หรือ hard delete
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get("hard") === "true";

    if (hard) {
      await hardDeleteRole(roleId);
    } else {
      await deleteRole(roleId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 },
    );
  }
}
