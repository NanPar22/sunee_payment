'use client'

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

type MenuItem = {
    id: number
    menuName: string
    path: string | null
    icon: string | null
    other_kaon_menu?: MenuItem[]
}

type UserInfo = {
    username: string
    roles: {
        roleName: string
        icon: string | null
    }[]
}

export default function Sidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const [menus, setMenus] = useState<MenuItem[]>([])
    const [user, setUser] = useState<UserInfo | null>(null) // ✅ เพิ่ม

    useEffect(() => {
        Promise.all([
            fetch("/api/system/menus/sidebar", { cache: "no-store" }).then(r => r.json()),
            fetch("/api/auth/info", { credentials: "include" }).then(r => r.json()),
        ]).then(([menuData, infoData]) => {
            if (menuData.success) setMenus(menuData.data)
            if (infoData.username) setUser({
                username: infoData.username,
                roles: infoData.roles ?? []
            })
        })
    }, [])

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        })
        router.push("/login")
        router.refresh()
    }

    return (
        <aside className="h-screen w-64 bg-linear-to-br from-blue-400 to-blue-600 px-2 pt-2 rounded-r-3xl shadow-sidebar font-main flex flex-col gap-0.5">
            {/* Profile */}
            <div className="w-full h-15 p-2 bg-white rounded-[14px] flex gap-2 border border-[#B3E5FC]">
                <div className="w-[20%] flex justify-center items-center object-cover bg-blue-50    rounded-full ">
                    {user?.roles?.[0]?.icon && (
                        <i className={`fa-solid ${user.roles[0].icon} text-2xl text-blue-600  `} />
                    )}
                </div>
                <div className="w-[55%] flex flex-col justify-center items-start gap-0.5">
                    <h1 className="font-main font-bold text-lg w-full">
                        {user?.username ?? "..."} {/* ✅ แสดง username */}
                    </h1>
                    <p className="font-main text-xs w-full">
                        {user?.roles?.[0]?.roleName ?? "..."}
                    </p>
                </div>
                <div className="w-[20%] flex flex-col justify-center items-center gap-1">
                    <div className="flex gap-1 justify-between items-center w-full h-[60%]">
                        <i className="fa-solid fa-bell"></i>
                        <i className="fa-solid fa-gear"></i>
                    </div>
                    <button onClick={handleLogout} className="btn-logout text-[12px] font-sans">
                        logout
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-0.5 bg-[#B3E5FC] my-2 rounded-full" />

            {/* Menu */}
            {menus.map((item) => {
                const isOpen = openMenu === item.menuName
                const hasSub = item.other_kaon_menu && item.other_kaon_menu.length > 0

                return (
                    <div key={item.id}>
                        {hasSub ? (
                            <button
                                onClick={() => setOpenMenu(isOpen ? null : item.menuName)}
                                className="w-full rounded-sm py-2 px-2 flex gap-1 items-center text-white hover:bg-blue-800/60"
                            >
                                <div className="w-[20%] flex justify-center">
                                    {item.icon && <i className={`fa-solid ${item.icon} text-2xl`} />}
                                </div>
                                <div className="w-[70%] font-semibold text-left">
                                    {item.menuName}
                                </div>
                                <div className="w-[10%] flex justify-center">
                                    <i className={`fa-solid fa-caret-right transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                </div>
                            </button>
                        ) : (
                            <Link
                                href={item.path ?? "#"}
                                className={`w-full rounded-sm py-2 px-2 flex gap-1 items-center text-white ${pathname === item.path ? "bg-blue-800/60" : "hover:bg-blue-800/60"}`}
                            >
                                <div className="w-[20%] flex justify-center">
                                    {item.icon && <i className={`fa-solid ${item.icon} text-2xl`} />}
                                </div>
                                <div className="w-[75%] font-semibold">
                                    {item.menuName}
                                </div>
                            </Link>
                        )}

                        {hasSub && isOpen && (
                            <div className="ml-10 mt-1 flex flex-col gap-1">
                                {item.other_kaon_menu!.map((sub) => (
                                    <Link
                                        key={sub.id}
                                        href={sub.path ?? "#"}
                                        className={`text-sm px-2 py-1 rounded text-white/90 hover:bg-blue-700/60 ${pathname === sub.path ? "bg-blue-700/70" : ""}`}
                                    >
                                        {sub.icon && <i className={`fa-solid ${sub.icon} mr-2`} />}
                                        {sub.menuName}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </aside>
    )
}   