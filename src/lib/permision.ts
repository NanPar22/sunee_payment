import { prisma } from "./prisma";
import { verifyToken, MenuPermission } from "@/lib/jwt";
import { cookies } from "next/headers";

export type Permission = {
  roleId: number;
  menuId: number;
  permissions: number[];
};

export type PermissionAction = "view" | "add" | "edit" | "delete" | "status";

const ACTION_MAP: Record<PermissionAction, number> = {
  view: 1,
  add: 2,
  edit: 3,
  delete: 4,
  status: 5,
};

export function parsePermissions(raw: string | null | undefined): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(Number);
    return [];
  } catch {
    return raw
      .split(",")
      .map(Number)
      .filter((n) => !isNaN(n));
  }
}

export function stringifyPermissions(permission: number[]): string {
  return JSON.stringify(permission);
}

export async function getAllPermissionByRole(roleId: number) {
  const [menus, roleMenus] = await Promise.all([
    prisma.kaon_menu.findMany({
      where: { isstatus: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.kaon_role_menu.findMany  ({
      where: { roleId },
    }),
  ]);

  return menus.map((menu) => {
    const perm = roleMenus.find((p) => p.menuId === menu.id);
    return {
      menuId: menu.id,
      menuName: menu.menuName,
      permissions: parsePermissions(perm?.permissions), 
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
          permissions: stringifyPermissions(p.permissions), 
        },
        create: {
          roleId,
          menuId: p.menuId,
          permissions: stringifyPermissions(p.permissions),
        },
      }),
    ),
  );
  return result;
}

export function checkAccess(
  permissions: number[] | null,
  action: PermissionAction,
): boolean {
  if (!permissions) return false;
  return permissions.includes(ACTION_MAP[action]);
}

export async function getPermissionsFromToken(): Promise<MenuPermission[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return [];
  try {
    const payload = verifyToken(token);
    return payload.permissions ?? [];
  } catch {
    return [];
  }
}
  
export async function checkPermissionByMenu(
  menuId: number,
  action: PermissionAction,
): Promise<boolean> {
  const permissions = await getPermissionsFromToken();
  const menu = permissions.find((p) => Number(p.menuId) === Number(menuId));
  if (!menu) return false;
  return checkAccess(menu.permissions, action); 
}
