import { NextResponse } from "next/server"
import { getSalesReport } from "@/lib/report"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const page = Number(searchParams.get("page") ?? 1)
  const pageSize = Number(searchParams.get("pageSize") ?? 10)

  const result = await getSalesReport({
    page,
    pageSize,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
  })

  return NextResponse.json({
    ...result,
    page,
    pageSize,
  })
}
