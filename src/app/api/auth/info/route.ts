import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const cookieStore = await cookies(); // ⭐ ต้อง await
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as {
    id: number;
    username: string;
    role: string;
    spid?: string;
  };

  return Response.json({
    id: payload.id,
    username: payload.username,
    role: payload.role,
    spid: payload.spid,
  });
}
