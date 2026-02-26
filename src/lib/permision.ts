import { prisma } from "./prisma";

export type Permission = {
  roleId: number;
  menuId: number;
  isview?: boolean | null;
  isadd?: boolean | null;
  isedit?: boolean | null;
  isdelete?: boolean | null;
  isstatus?: boolean | null;
};

export type PermissionAction =
  | "isview"
  | "isadd"
  | "isedit"
  | "isdelete"
  | "isstatus";

export async function getAllPermissionByRole(roleId: number) {
  const [menus, permissions] = await Promise.all([
    prisma.kaon_menu.findMany({
      where: { isstatus: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.kaon_role_menu.findMany({
      where: { roleId },
    }),
  ]);

  // merge menu ทั้งหมด + permission ที่มี
  return menus.map((menu) => {
    const perm = permissions.find((p) => p.menuId === menu.id);
    return {
      menuId: menu.id,
      menuName: menu.menuName,
      isview: perm?.isview ?? false,
      isadd: perm?.isadd ?? false,
      isedit: perm?.isedit ?? false,
      isdelete: perm?.isdelete ?? false,
      isstatus: perm?.isstatus ?? false,
    };
  });
}
export async function upsertPermissionBulk(
  roleId: number,
  permissions: Omit<Permission, "roleId">[],
) {
  const result = await Promise.all(
    permissions.map((p) =>
      prisma.kaon_role_menu.upsert({
        where: {
          roleId_menuId: { roleId, menuId: p.menuId },
        },
        update: {
          isview: p.isview,
          isadd: p.isadd,
          isedit: p.isedit,
          isdelete: p.isdelete,
          isstatus: p.isstatus,
        },
        create: {
          roleId,
          menuId: p.menuId,
          isview: p.isview,
          isadd: p.isadd,
          isedit: p.isedit,
          isdelete: p.isdelete,
          isstatus: p.isstatus,
        },
      }),
    ),
  );
  return result;
}

export function checkAccess(
  permission: Omit<Permission, "roleId" | "menuId"> | null,
  action: PermissionAction,
): boolean {
  if (!permission) return false;
  return permission[action] === true;
}
