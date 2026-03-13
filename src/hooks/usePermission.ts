// hooks/usePermission.ts
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // ✅ เพิ่ม

export function usePermission() {
  // ✅ ไม่ต้องส่ง path มาแล้ว
  const pathname = usePathname(); // ✅ ดึง path ปัจจุบันเอง

  const [canView, setCanView] = useState(false);
  const [canAdd, setCanAdd] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [canStatus, setCanStatus] = useState(false);

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        const res = await fetch("/api/auth/info");
        const data = await res.json();

        const menuPerm = data.permissions?.find(
          (p: any) => p.path === pathname, // ✅ ใช้ pathname จาก usePathname
        );

        const perms: number[] = menuPerm?.permissions ?? [];

        setCanView(perms.includes(1));
        setCanAdd(perms.includes(2));
        setCanEdit(perms.includes(3));
        setCanDelete(perms.includes(4));
        setCanStatus(perms.includes(5));
      } catch {}
    };

    fetchPermission();
  }, [pathname]);

  return { canView, canAdd, canEdit, canDelete, canStatus };
}
