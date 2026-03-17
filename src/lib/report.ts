import { prisma } from "@/lib/prisma";

export type GetReportParams = {
  page: number;
  pageSize: number;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  spid?: string;
};

  export type ReportItem = {
    id: number;
  saleman: string;
  docno: string;
  ref1: string | null;
  ref2: string | null;
  amount: number;
  dateTime: string; // ส่งเป็น string ให้ frontend
  cusName: string;
  tender_id: string;
  bankRef: string | null;
  respMsg: string;
  qrContent: string | null;
};

export async function getReport(params: GetReportParams) {
  const { page, pageSize, search, dateFrom, dateTo, spid } = params;

  const where: any = {};

  if (spid) {
    where.saleman = spid;
  }
  where.tender_id = "14";

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

  const rawItems = await prisma.kaon_checklistlog.findMany({
    where,
    select: {
      id: true,
      saleman: true,
      docno: true,
      ref1: true,
      ref2: true,
      amount: true,
      dateTime: true,
      cusName: true,
      tender_id: true,
      bankRef: true,
      respMsg: true,
      qrContent: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { dateTime: "desc" },
  });

  const items = rawItems.map((i) => ({
    id: i.id,
    saleman: i.saleman,
    docno: i.docno,
    ref1: i.ref1,
    ref2: i.ref2,
    amount: i.amount ? Number(i.amount) : 0,
    payment: i.tender_id, // ✅ ใช้ตัวนี้แทน
    dateTime: i.dateTime ? i.dateTime.toISOString() : "",
    cusName: i.cusName,
    bankRef: i.bankRef,
    respMsg: i.respMsg,
    qrContent: i.qrContent,
  }));

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

export async function getReportInfo(params: GetReportParams) {
  const { page, pageSize, search, dateFrom, dateTo, spid } = params;

  const where: any = {};

  if (spid) {
    where.saleman = spid;
  }
  where.tender_id = "14";

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

  const rawItems = await prisma.kaon_checklistlog.findMany({
    where,
    select: {
      id: true,
      saleman: true,
      docno: true,
      ref1: true,
      ref2: true,
      amount: true,
      dateTime: true,
      cusName: true,
      tender_id: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { dateTime: "desc" },
  });

  const items = rawItems.map((i) => ({
    id: i.id,
    saleman: i.saleman,
    docno: i.docno,
    ref1: i.ref1,
    ref2: i.ref2,
    amount: i.amount ? Number(i.amount) : 0,
    payment: i.tender_id, // ✅ ใช้ตัวนี้แทน
    dateTime: i.dateTime ? i.dateTime.toISOString() : "",
    cusName: i.cusName,
  }));

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
