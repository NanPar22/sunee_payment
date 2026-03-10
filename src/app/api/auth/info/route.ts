import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = verifyToken(token);

    return Response.json({
      id: payload.id,
      username: payload.username,
      role: payload.role,
      roleId: payload.roleId,
      spid: payload.spid,
      permissions: payload.permissions ?? [], 
    });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}
