import { NextRequest, NextResponse } from "next/server";
import { updateMenu } from "@/lib/menu";

interface UpdateMenuBody {
  menuName?: string;
  path?: string;
  icon?: string;
  sortOrder?: number;
  isstatus?: boolean;
  parentId?: number | null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }, // ✅ เปลี่ยนเป็น Promise
) {
  try {
    // ✅ await params ก่อน
    const { id: idParam } = await context.params;

    // Validate ID
    const id = parseInt(idParam);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: "ID ไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    // Parse body
    const body: UpdateMenuBody = await request.json();
    const { menuName, path, icon, sortOrder, isstatus, parentId } = body;

    // Validate menuName
    if (!menuName || menuName.trim() === "") {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุชื่อเมนู" },
        { status: 400 },
      );
    }

    // Validate path
    if (path && !path.trim().startsWith("/")) {
      return NextResponse.json(
        { success: false, error: "path ต้องขึ้นต้นด้วย /" },
        { status: 400 },
      );
    }

    // Validate sortOrder
    if (sortOrder !== undefined && (isNaN(sortOrder) || sortOrder < 0)) {
      return NextResponse.json(
        { success: false, error: "sortOrder ต้องเป็นตัวเลข >= 0" },
        { status: 400 },
      );
    }

    // Update menu
    const result = await updateMenu({
      id,
      menuName: menuName.trim(),
      path: path?.trim(),
      icon: icon?.trim(),
      sortOrder:
        sortOrder !== undefined ? parseInt(sortOrder.toString()) : undefined,
      isstatus: isstatus !== undefined ? Boolean(isstatus) : undefined,
      parentId:
        parentId !== undefined
          ? parentId === null
            ? null
            : parseInt(parentId.toString())
          : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "แก้ไขเมนูสำเร็จ",
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating menu:", error);

    if (error.message === "ไม่พบเมนูที่ต้องการแก้ไข") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "เกิดข้อผิดพลาดในการแก้ไขเมนู",
      },
      { status: 500 },
    );
  }
}
