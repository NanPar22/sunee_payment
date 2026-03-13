import { prisma } from "@/lib/prisma";
import { comparePassword } from "./password";
import { signToken } from "./jwt";
import { json } from "stream/consumers";

const parsePermisions = (raw: string | null | undefined): number[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(Number);
    return [];
  } catch (error) {
    return raw
      .split(",")
      .map(Number)
      .filter((n) => !isNaN(n));
  }
};

export async function loginUser(username: string, password: string) {
  try {
    const user = await prisma.kaon_servicepoint.findFirst({
      where: {
        UserName: username,
      },
      include: {
        kaon_role: {
          select: {
            id: true,
            roleName: true,
            roleCode: true,
            kaonRoleMenus: {
              select: {
                menuId: true,
                permissions: true,
                menu: {
                  select: {
                    path: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    if (!user.Password || !user.UserName) {
      await comparePassword(password, "$2a$10$abcdefghijklmnopqrstuv"); // fake hash
      return null;
    }

    let ok = false;
    if (user.Password.startsWith("$2")) {
      ok = await comparePassword(password, user.Password);
    } else {
      ok = password === user.Password;
    }

    if (!ok) return null;

    const roleName = user.kaon_role?.roleName ?? "user";

    const permissions =
      user.kaon_role?.kaonRoleMenus?.map((rm) => ({
        menuId: rm.menuId,
        path: rm.menu?.path ?? null,
        permissions: parsePermisions(rm.permissions),
      })) ?? [];

    const token = signToken({
      id: user.id,
      roleId: user.kaon_role?.id ?? 0, // เพิ่มตรงนี้
      username: user.UserName,
      role: roleName,
      spid: user.SPID || undefined,
      permissions,
    });

    return {
      user: {
        id: user.id,
        username: user.UserName,
        role: roleName,
        spid: user.SPID,
      },
      token,
    };
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return null;
  }
}
