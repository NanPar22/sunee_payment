"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();

  const [username, setUsername] = useState("De_Angkhana");
  const [password, setPassword] = useState("1234");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok) {
        throw new Error(data?.message || "เข้าสู่ระบบไม่สำเร็จ");
      }

      router.push("/report");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    password,
    setUsername,
    setPassword,
    isLoading,
    error,
    login,
  };
}
