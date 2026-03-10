import { prisma } from "@/lib/prisma";
import { comparePassword } from "./password";
import { signToken } from "./jwt";

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
              where: { isstatus: true },
              select: {
                menuId: true,
                isview: true,
                isadd: true,
                isedit: true,
                isdelete: true,
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
        isview: rm.isview ?? false,
        isadd: rm.isadd ?? false,
        isedit: rm.isedit ?? false,
        isdelete: rm.isdelete ?? false,
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
