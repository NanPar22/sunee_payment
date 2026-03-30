// app/(main)/repost/layout.tsx

import Sidebar from "../components/layout/SideBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-1 h-screen overflow-hidden ">
      <Sidebar />
      {/* ✅ เพิ่ม h-full เพื่อส่ง height ต่อให้ children */}
      <main className="flex-1 h-full p-1 max-xl:pl-18 max-sm:pl-0 n min-h-0 overflow-hidden">
        {children}
      </main> 
    </div>
  );
}0