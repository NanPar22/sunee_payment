// lib/role.ts
import { prisma } from "@/lib/prisma";

export async function getRoleList(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: boolean;
}) {
  const { page, pageSize, search, status } = params;

  const where: any = {};

  if (search) {
    where.OR = [
      { roleName: { contains: search } },
      { roleCode: { contains: search } },
    ];
  }

  // 🔥 จุดสำคัญ
  if (status !== undefined) {
    where.isstatus = status;
  }

  const [data, total] = await Promise.all([
    prisma.kaon_role.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id: "desc" },
    }),
    prisma.kaon_role.count({ where }),
  ]);

  return { data, total, page, pageSize };
}
