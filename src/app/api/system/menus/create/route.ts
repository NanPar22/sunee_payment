import { NextRequest, NextResponse } from "next/server";
import { createMenu } from "@/lib/menu";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { menuName, path, icon, sortOrder, isstatus, parentId } = body;

    // Validation
    if (!menuName || menuName.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาระบุชื่อเมนู",
        },
        { status: 400 }
      );
    }

    const result = await createMenu({
      menuName: menuName.trim(),
      path: path?.trim() || undefined,
      icon: icon?.trim() || undefined,
      sortOrder: sortOrder ? parseInt(sortOrder) : undefined,
      isstatus: isstatus !== undefined ? Boolean(isstatus) : true,
      parentId: parentId ? parseInt(parentId) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "สร้างเมนูสำเร็จ",
      data: result,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "เกิดข้อผิดพลาดในการสร้างเมนู",
      },
      { status: 500 }
    );
  }
}