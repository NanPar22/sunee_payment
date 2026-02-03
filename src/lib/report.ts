import { prisma } from "@/lib/prisma";

export type GetReportParams = {
  page: number;
  pageSize: number;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  spid?: string;
};

export async function getReport(params: GetReportParams) {
  const { page, pageSize, search, dateFrom, dateTo , spid} = params;

  const where: any = {};

  if (spid) {
    where.saleman = spid;
  }

  // 🔍 search
  if (search) {
    where.OR = [
      { saleman: { contains: search } },
      { docno: { contains: search } },
      { ref1: { contains: search } },
      { ref2: { contains: search } },
      { cusName: { contains: search } },
    ];
  }

  // 📅 date from / to (ใช้ field ให้ตรงกับ schema)
  if (dateFrom || dateTo) {
    where.dateTime = {};
    if (dateFrom) where.dateTime.gte = dateFrom;
    if (dateTo) where.dateTime.lte = dateTo;
  }

  // ดึงข้อมูล
  const items = await prisma.kaon_checklistlog.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { dateTime: "desc" },
  });

  // นับจำนวนทั้งหมด
  const total = await prisma.kaon_checklistlog.count({
    where,
  });

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
