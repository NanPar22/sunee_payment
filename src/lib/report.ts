import { prisma } from "@/lib/prisma"

type GetSalesParams = {
  page: number
  pageSize: number
  from?: string
  to?: string
  keyword?: string
}

export async function getSalesReport(params: GetSalesParams) {
  const { page, pageSize, from, to, keyword } = params

  const where: any = {}

  if (from && to) {
    where.dateTime = {
      gte: new Date(from),
      lte: new Date(to),
    }
  }

  if (keyword) {
    where.OR = [
      { docno: { contains: keyword } },
      { ref1: { contains: keyword } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.kaon_checklistlog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { dateTime: "desc" },
      select: {
        dateTime: true,
        ref1: true,
        ref2: true,
        docno: true,
        amount: true,
        channel: true,
        respCode: true,
      },
    }),
    prisma.kaon_checklistlog.count({ where }),
  ])

  return {
    data,
    total,
    totalPages: Math.ceil(total / pageSize),
  }
}
