import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password required" },
        { status: 400 }
      );
    }

    const result = await loginUser(username, password);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Login failed" },
        { status: 401 }
      );
    }
    
    const res = NextResponse.json({
      success: true,
      user: result.user,
    });

    res.cookies.set("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 วัน
    });

    return res;
  } catch (error) {
    console.error("LOGIN API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
