import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "./password";
import { signToken } from "./jwt";

export async function loginUser(username: string, password: string) {
  try {
    const user = await prisma.kaon_servicepoint.findFirst({
      where: {
        UserName: username,
      },
      select: {
        id: true,
        UserName: true,
        Password: true,
        SPID: true,
        ServiceTypeName: true,
      },
    });

    if (!user) {
      return null;
    }

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

    const token = signToken({
      id: user.id,
      username: user.UserName,
      role: user.ServiceTypeName ?? "user",
      spid: user.SPID || undefined,
    });

    return {
      user: {
        id: user.id,
        username: user.UserName,
        role: user.ServiceTypeName ?? "user",
        spid: user.SPID,
      },
      token,
    };
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return null;
  }
}
