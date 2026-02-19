import { prisma } from "@/lib/prisma";

export type GetUserParams = {
  page: number;
  pageSize: number;
  search?: string;
  status?: boolean;
  role?: number;
};

export type CreateUserParams = {
  spid: string;
  username: string;
  roleId: number;
  status?: string;
};

export type UpdateUserParams = {
  spid?: string;
  username?: string;
  roleId?: number;
  status?: string;
};

export async function getUsers(params: GetUserParams) {
  const { page, pageSize, search, status, role } = params;

  const where: any = {};

  if (search) {
    where.OR = [
      { UserName: { contains: search } },
      { SPID: { contains: search } },
      { ServiceTypeName: { contains: search } },
    ];
  }

  if (typeof status === "boolean") {
    where.IsStatus = status ? "1" : "0";
  }

  if (role) {
    where.kaon_role = {
      roleName: role,
    };
  }

  const items = await prisma.kaon_servicepoint.findMany({
    where,
    distinct: ["SPID"],
    include: { kaon_role: true },
    orderBy: { id: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalItems = await prisma.kaon_servicepoint.findMany({
    where,
    distinct: ["SPID"],
    select: { SPID: true },
  });

  const total = totalItems.length;

  return {
    items: items.map((u) => ({
      id: u.id,
      username: u.UserName,
      spid: u.SPID,
      role: u.kaon_role?.roleName ?? "No Role",
      status: u.IsStatus,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ✅ CREATE
export async function createUser(params: CreateUserParams) {
  const { spid, username, roleId, status = "Y" } = params;

  const existing = await prisma.kaon_servicepoint.findFirst({
    where: { SPID: spid },
  });

  if (existing) {
    throw new Error(`SPID "${spid}" already exists`);
  }

  const created = await prisma.kaon_servicepoint.create({
    data: {
      SPID: spid,
      UserName: username,
      roleId: roleId,
      IsStatus: status,
    },
    include: { kaon_role: true },
  });

  return {
    id: created.id,
    spid: created.SPID,
    username: created.UserName,
    role: created.kaon_role?.roleName ?? "No Role",
    status: created.IsStatus,
  };
}

// ✅ UPDATE
export async function updateUser(id: number, params: UpdateUserParams) {
  const { spid, username, roleId, status } = params;

  const existing = await prisma.kaon_servicepoint.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`User id "${id}" not found`);
  }

  const updated = await prisma.kaon_servicepoint.update({
    where: { id },
    data: {
      ...(spid && { SPID: spid }),
      ...(username && { UserName: username }),
      ...(roleId && { roleId: roleId }),
      ...(status && { IsStatus: status }),
    },
    include: { kaon_role: true },
  });

  return {
    id: updated.id,
    spid: updated.SPID,
    username: updated.UserName,
    roleId: updated.roleId,
    role: updated.kaon_role?.roleName ?? "No Role",
    status: updated.IsStatus,
  };
}

// ✅ DELETE
export async function deleteUser(id: number) {
  const existing = await prisma.kaon_servicepoint.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`User id "${id}" not found`);
  }

  await prisma.kaon_servicepoint.delete({
    where: { id },
  });

  return { success: true, id };
}
