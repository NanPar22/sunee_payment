// lib/role.ts
import { prisma } from "@/lib/prisma";
import { id } from "date-fns/locale";

export type GetroleParams = {
  page: number;
  pageSiae: number;
  search?: string;
};
export type RoleItem = {
  id: number;
  roleCode: string;
  roleName: string;
  isstatus: boolean;
  description: string;
};

export type CreateRole = {
  roleCode: string;
  roleName: string;
  isstatus: boolean;
  description: string;
};

export async function getRoleList(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: boolean;
}) {
  const { page, pageSize, search, status } = params;

  const where: any = {};

  if (search) {
    where.OR = [{ roleName: { contains: search } }];
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
      orderBy: { id: "asc" },
    }),
    prisma.kaon_role.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createRole(params: CreateRole) {
  const { roleCode, roleName, isstatus, description } = params;

  if (!roleCode?.trim() || !roleName?.trim()) {
    throw new Error("Role code and role name are required");
  }

  try {
    const role = await prisma.kaon_role.create({
      data: {
        roleCode: roleCode.trim(),
        roleName: roleName.trim(),
        description: description?.trim(),
        isstatus,
      },
    });

    return role;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Role code already exists");
    }
    throw error;
  }
}

export async function updateRole(id: number, params: CreateRole) {
  const { roleCode, roleName, isstatus, description } = params;

  if (!roleCode?.trim() || !roleName?.trim()) {
    throw new Error("Role code and role name are required");
  }

  try {
    const role = await prisma.kaon_role.update({
      where: { id },
      data: {
        roleCode: roleCode.trim(),
        roleName: roleName.trim(),
        description: description?.trim(),
        isstatus,
      },
    });

    return role;
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Role code already exists");
    }
    throw error;
  }
}

export async function deleteRole(id: number) {
  if (!id || isNaN(id)) {
    throw new Error("Invalid role id");
  }

  return prisma.kaon_role.delete({
    where: { id },
  });
}
