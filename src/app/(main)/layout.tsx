// app/(main)/repost/layout.tsx

import Sidebar from "../components/layout/SideBar";


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-1 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-1">
        {children}
      </main>
    </div>
  );
}
