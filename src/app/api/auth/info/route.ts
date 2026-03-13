import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { parsePermissions } from "@/lib/permision";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = verifyToken(token);

    // ✅ ดึงจาก DB พร้อม cache ต่อ roleId
    const getPermissions = unstable_cache(
      async (roleId: number) => {
        const roleMenus = await prisma.kaon_role_menu.findMany({
          where: { roleId },
          select: {
            menuId: true,
            permissions: true,
            menu: { select: { path: true } },
          },
        });
        return roleMenus.map((rm) => ({
          menuId: rm.menuId,
          path: rm.menu?.path ?? null,
          permissions: parsePermissions(rm.permissions),
        }));
      },
      [`permissions-${payload.roleId}`],
      { tags: [`permissions-${payload.roleId}`] }
    );

    const permissions = await getPermissions(payload.roleId);

    return Response.json({
      id: payload.id,
      username: payload.username,
      role: payload.role,
      roleId: payload.roleId,
      spid: payload.spid,
      permissions, // ✅ ใช้จาก DB แทน token
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}