import { getSidebarMenu } from "@/lib/menu";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getSidebarMenu();

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Menu Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sidebar menu",
      },
      { status: 500 }
    );
  }
}

