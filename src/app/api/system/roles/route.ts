// app/api/roles/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getRoleList } from "@/lib/role"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10)
    const search = searchParams.get("search") || undefined

    // 🔘 status → boolean | undefined
    const statusParam = searchParams.get("status")
    const status =
      statusParam === "true"
        ? true
        : statusParam === "false"
        ? false
        : undefined // all

    const result = await getRoleList({
      page,
      pageSize,
      search,
      status, // boolean | undefined
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("GET /api/roles error:", error)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }
}
