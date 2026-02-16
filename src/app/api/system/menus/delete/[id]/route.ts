import { NextRequest, NextResponse } from "next/server";
import { deleteMenu } from "@/lib/menu";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 🔥 ต้อง await params ก่อน
    const { id } = await context.params;

    console.log("ID:", id);

    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "ID ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const result = await deleteMenu(numericId);

    return NextResponse.json({
      success: true,
      message: result?.message || "ลบเมนูสำเร็จ",
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "เกิดข้อผิดพลาด",
      },
      { status: 500 }
    );
  }
}
