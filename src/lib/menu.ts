import { prisma } from "@/lib/prisma";

export type GetMenuParams = {
  page: number;
  pageSize: number;
  search?: string;
  status?: boolean;
};

export type CreateMenuInput = {
  menuName: string;
  path?: string;
  icon?: string;
  sortOrder?: number;
  isstatus?: boolean;
  parentId?: number;
};

export type UpdateMenuInput = {
  id: number;
  menuName?: string;
  path?: string;
  icon?: string;
  sortOrder?: number;
  isstatus?: boolean;
  parentId?: number | null;
};

/* =========================================
   ✅ สำหรับหน้า Admin จัดการเมนู (มี pagination)
========================================= */
export async function getMenuList(params: GetMenuParams) {
  const { page, pageSize, search, status } = params;

  const where: any = {
    parentId: null, // ✅ ดึงเฉพาะเมนูหลัก
  };

  if (search) {
    where.menuName = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (typeof status === "boolean") {
    where.isstatus = status;
  }

  const total = await prisma.kaon_menu.count({
    where,
  });

  const data = await prisma.kaon_menu.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: {
      id: true,
      menuName: true,
      isstatus: true,
      path: true,
      icon: true,
      sortOrder: true,

      // ✅ ดึงเมนูย่อย
      other_kaon_menu: {
        select: {
          id: true,
          menuName: true,
          isstatus: true,
          path: true,
          icon: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/* =========================================
   ✅ สำหรับ Sidebar (Dynamic Menu)
========================================= */
export async function getSidebarMenu() {
  return prisma.kaon_menu.findMany({
    where: {
      isstatus: true,
      parentId: null,
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      id: true,
      menuName: true,
      path: true,
      icon: true,
      sortOrder: true,
      other_kaon_menu: {
        select: {
          id: true,
          menuName: true,
          path: true,
          icon: true,
          sortOrder: true,
        },
        where: {
          isstatus: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
}

/* =========================================
   ✅ ดึงเมนูตาม ID
========================================= */
export async function getMenuById(id: number) {
  const menu = await prisma.kaon_menu.findUnique({
    where: { id },
    include: {
      other_kaon_menu: {
        select: {
          id: true,
          menuName: true,
          isstatus: true,
          path: true,
          icon: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!menu) {
    throw new Error("ไม่พบเมนูที่ต้องการ");
  }

  return menu;
}

/* =========================================
   ✅ สร้างเมนูใหม่
========================================= */
export async function createMenu(input: CreateMenuInput) {
  const { menuName, path, icon, sortOrder, isstatus, parentId } = input;

  // ✅ ตรวจสอบว่ามีชื่อเมนูซ้ำหรือไม่
  const existingMenu = await prisma.kaon_menu.findFirst({
    where: {
      menuName,
      parentId: parentId || null,
    },
  });

  if (existingMenu) {
    throw new Error("ชื่อเมนูนี้มีอยู่แล้ว");
  }

  // ✅ ถ้าไม่ระบุ sortOrder ให้หาค่าสูงสุด + 1
  let finalSortOrder = sortOrder;
  if (!sortOrder) {
    const maxOrder = await prisma.kaon_menu.findFirst({
      where: {
        parentId: parentId || null,
      },
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        sortOrder: true,
      },
    });

    finalSortOrder = (maxOrder?.sortOrder || 0) + 1;
  }

  // ✅ ถ้ามี parentId ต้องตรวจสอบว่า parent มีอยู่จริง
  if (parentId) {
    const parentMenu = await prisma.kaon_menu.findUnique({
      where: { id: parentId },
    });

    if (!parentMenu) {
      throw new Error("ไม่พบเมนูหลักที่ระบุ");
    }
  }

  const newMenu = await prisma.kaon_menu.create({
    data: {
      menuName,
      path: path || null,
      icon: icon || null,
      sortOrder: finalSortOrder,
      isstatus: isstatus ?? true,
      parentId: parentId || null,
    },
    include: {
      other_kaon_menu: true,
    },
  });

  return newMenu;
}

/* =========================================
   ✅ แก้ไขเมนู
========================================= */
export async function updateMenu(input: UpdateMenuInput) {
  const { id, menuName, path, icon, sortOrder, isstatus, parentId } = input;

  // ✅ ตรวจสอบว่าเมนูมีอยู่จริง
  const existingMenu = await prisma.kaon_menu.findUnique({
    where: { id },
  });

  if (!existingMenu) {
    throw new Error("ไม่พบเมนูที่ต้องการแก้ไข");
  }

  // ✅ ตรวจสอบชื่อซ้ำ (ยกเว้นตัวเอง)
  if (menuName) {
    const duplicateMenu = await prisma.kaon_menu.findFirst({
      where: {
        menuName,
        parentId: parentId !== undefined ? parentId : existingMenu.parentId,
        id: {
          not: id,
        },
      },
    });

    if (duplicateMenu) {
      throw new Error("ชื่อเมนูนี้มีอยู่แล้ว");
    }
  }

  // ✅ ตรวจสอบว่าไม่ได้ตั้ง parentId เป็นตัวเอง
  if (parentId === id) {
    throw new Error("ไม่สามารถตั้งเมนูเป็น parent ของตัวเองได้");
  }

  // ✅ ถ้ามี parentId ใหม่ ต้องตรวจสอบว่ามีอยู่จริง
  if (parentId && parentId !== existingMenu.parentId) {
    const parentMenu = await prisma.kaon_menu.findUnique({
      where: { id: parentId },
    });

    if (!parentMenu) {
      throw new Error("ไม่พบเมนูหลักที่ระบุ");
    }

    // ✅ ป้องกันการทำ circular reference (parent ของ parent เป็นตัวเอง)
    if (parentMenu.parentId === id) {
      throw new Error("ไม่สามารถสร้างความสัมพันธ์แบบวงกลมได้");
    }
  }

  const updatedMenu = await prisma.kaon_menu.update({
    where: { id },
    data: {
      ...(menuName !== undefined && { menuName }),
      ...(path !== undefined && { path }),
      ...(icon !== undefined && { icon }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isstatus !== undefined && { isstatus }),
      ...(parentId !== undefined && { parentId }),
    },
    include: {
      other_kaon_menu: true,
    },
  });

  return updatedMenu;
}


/* =========================================
   ✅ ลบเมนู
========================================= */
export async function deleteMenu(id: number) {
  // ✅ ตรวจสอบว่าเมนูมีอยู่จริง
  const existingMenu = await prisma.kaon_menu.findUnique({
    where: { id },
    include: {
      other_kaon_menu: true,
    },
  });

  if (!existingMenu) {
    throw new Error("ไม่พบเมนูที่ต้องการลบ");
  }

  // ✅ ถ้าเป็นเมนูหลัก และยังมีเมนูย่อย → ไม่ให้ลบ
  if (existingMenu.parentId === null && existingMenu.other_kaon_menu.length > 0) {
    throw new Error("ไม่สามารถลบเมนูหลักที่มีเมนูย่อยได้ กรุณาลบเมนูย่อยก่อน");
  }

  // ✅ ใช้ transaction เพื่อความปลอดภัย
  await prisma.$transaction(async (tx) => {
    // ถ้าเป็นเมนูย่อย → ลบได้เลย
    await tx.kaon_menu.delete({
      where: { id },
    });
  });

  return { message: "ลบเมนูสำเร็จ" };
}


/* =========================================
   ✅ เปลี่ยนลำดับเมนู (Reorder)
========================================= */
export async function reorderMenu(
  menuOrders: { id: number; sortOrder: number }[],
) {
  // ✅ ใช้ transaction เพื่อความปลอดภัย
  await prisma.$transaction(
    menuOrders.map((item) =>
      prisma.kaon_menu.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  return { message: "เปลี่ยนลำดับเมนูสำเร็จ" };
}

/* =========================================
   ✅ เปิด/ปิดสถานะเมนู
========================================= */
export async function toggleMenuStatus(id: number) {
  const menu = await prisma.kaon_menu.findUnique({
    where: { id },
  });

  if (!menu) {
    throw new Error("ไม่พบเมนูที่ต้องการ");
  }

  const updatedMenu = await prisma.kaon_menu.update({
    where: { id },
    data: {
      isstatus: !menu.isstatus,
    },
  });

  return updatedMenu;
}
