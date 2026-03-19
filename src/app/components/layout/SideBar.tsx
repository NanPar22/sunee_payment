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

// Skeleton loader สำหรับ menu item
function MenuSkeleton({ collapsed }: { collapsed: boolean }) {
    return (
        <div className="animate-pulse flex flex-col gap-0.5">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className={`h-10 bg-blue-300/40 rounded-sm ${collapsed ? "w-10 mx-auto" : "w-full"}`}
                />
            ))}
        </div>
    )
}

// Skeleton loader สำหรับ profile
function ProfileSkeleton({ collapsed }: { collapsed: boolean }) {
    if (collapsed) {
        return (
            <div className="w-10 h-10 mx-auto bg-blue-300/40 rounded-lg animate-pulse" />
        )
    }
    return (
        <div className="w-full h-15 p-2 bg-white rounded-[14px] flex gap-2 border border-[#B3E5FC] animate-pulse">
            <div className="w-[20%] bg-blue-100 rounded-lg" />
            <div className="w-[55%] flex flex-col justify-center gap-1.5">
                <div className="h-4 bg-blue-100 rounded w-3/4" />
                <div className="h-3 bg-blue-100 rounded w-1/2" />
            </div>
            <div className="w-[20%] flex flex-col justify-center items-center gap-1">
                <div className="h-4 bg-blue-100 rounded w-full" />
                <div className="h-4 bg-blue-100 rounded w-full" />
            </div>
        </div>
    )
}

export default function Sidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const [menus, setMenus] = useState<MenuItem[]>([])
    const [user, setUser] = useState<UserInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isCollapsed, setIsCollapsed] = useState(true)

    // Auto-collapse based on screen size
    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 640px)")
        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsCollapsed(!e.matches)
        }
        handleChange(mediaQuery)
        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
    }, [])

    useEffect(() => {
        setIsLoading(true)
        setError(null)

        Promise.all([
            fetch("/api/system/menus/sidebar")
                .then(r => {
                    if (!r.ok) throw new Error("Failed to load menus")
                    return r.json()
                })
                .catch(() => ({ success: false, data: [] })),

            fetch("/api/auth/info", { credentials: "include" })
                .then(r => {
                    if (!r.ok) throw new Error("Failed to load user info")
                    return r.json()
                })
                .catch(() => null),
        ])
            .then(([menuData, infoData]) => {
                if (menuData.success) {
                    setMenus(menuData.data)
                } else {
                    setError("ไม่สามารถโหลดเมนูได้")
                }

                if (infoData?.username) {
                    setUser({
                        username: infoData.username,
                        roles: infoData.roles ?? [],
                    })
                }
            })
            .catch(() => {
                setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [])

    const handleLogout = async () => {
        if (isLoggingOut) return
        setIsLoggingOut(true)
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            })
            router.push("/login")
            router.refresh()
        } catch {
            router.push("/login")
        } finally {
            setIsLoggingOut(false)
        }
    }

    const isActivePath = (path: string | null) => {
        if (!path) return false
        if (path === "/") return pathname === "/"
        return pathname === path || pathname.startsWith(path + "/")
    }

    const handleToggle = () => {
        setIsCollapsed(prev => !prev)
        // ปิด submenu ที่เปิดอยู่เมื่อ collapse
        if (!isCollapsed) setOpenMenu(null)
    }

    return (
        <aside
            className={`h-screen bg-linear-to-br from-blue-400 to-blue-600 p-2 rounded-r-3xl shadow-sidebar font-main flex flex-col gap-0.5 transition-all duration-300 ease-in-out ${isCollapsed ? "w-18" : "w-18 sm:w-64"
                }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center h-10  px-2 rounded-sm overflow-hidden">
                {!isCollapsed && (
                    <span className="text-xl font-semibold whitespace-nowrap overflow-hidden">
                        Sunee_Payment
                    </span>
                )}
                <button
                    aria-label={isCollapsed ? "ขยาย sidebar" : "ย่อ sidebar"}
                    onClick={handleToggle}
                    className={`shrink-0 ${isCollapsed ? "mx-auto" : ""}`}
                >
                    <i
                        className={`fa-solid ${isCollapsed ? "fa-bars" : "fa-xmark"} text-blue-600 bg-linear-to-br from-blue-200 to-blue-400 py-0.5  rounded-sm transition-all duration-300`}
                    />
                </button>
            </div>

            {/* Divider */}
            <div className="flex justify-center">
                <div className={`h-0.5 bg-white my-1 rounded-full transition-all duration-300 ${isCollapsed ? "w-8" : "w-50"}`} />
            </div>

            {/* Menu */}
            <nav
                aria-label="เมนูหลัก"
                className="flex flex-col gap-0.5 overflow-y-auto flex-1 pb-2"
            >
                {isLoading ? (
                    <MenuSkeleton collapsed={isCollapsed} />
                ) : error ? (
                    <div className="text-white/80 text-sm text-center px-2 py-4">
                        <i className="fa-solid fa-triangle-exclamation mb-1 block" aria-hidden="true" />
                        {!isCollapsed && error}
                    </div>
                ) : menus.length === 0 ? (
                    <div className="text-white/60 text-sm text-center px-2 py-4">
                        {!isCollapsed && "ไม่พบเมนู"}
                    </div>
                ) : (
                    menus.map((item) => {
                        const isOpen = openMenu === item.menuName
                        const hasSub = item.other_kaon_menu && item.other_kaon_menu.length > 0

                        return (
                            <div key={item.id}>
                                {hasSub ? (
                                    <button
                                        onClick={() => setOpenMenu(isOpen ? null : item.menuName)}
                                        aria-expanded={isOpen}
                                        aria-haspopup="true"
                                        aria-controls={`submenu-${item.id}`}
                                        title={isCollapsed ? item.menuName : undefined}
                                        className={`w-full rounded-sm py-1.5 px-2 flex gap-1 items-center text-white hover:bg-blue-800/60 transition-colors duration-150 ${isCollapsed ? "justify-center" : ""
                                            }`}
                                    >
                                        <div className={`flex justify-center relative ${isCollapsed ? "" : "w-[20%]"}`}>
                                            {item.icon && (
                                                <i className={`fa-solid ${item.icon} text-[18px]`} aria-hidden="true" />
                                            )}
                                            {isCollapsed && (
                                                <i
                                                    className={`fa-solid fa-caret-down text-[8px] absolute -bottom-1 -right-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <>
                                                <div className="w-[70%] font-extralight text-left">
                                                    {item.menuName}
                                                </div>
                                                <div className="w-[10%] flex justify-center">
                                                    <i
                                                        className={`fa-solid fa-caret-right transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <Link
                                        href={item.path ?? "#"}
                                        aria-current={isActivePath(item.path) ? "page" : undefined}
                                        title={isCollapsed ? item.menuName : undefined}
                                        className={`w-full rounded-sm py-1.5 px-2 flex gap-1 items-center text-white transition-colors duration-150 ${isActivePath(item.path) ? "bg-blue-800/60" : "hover:bg-blue-800/60"
                                            } ${isCollapsed ? "justify-center" : ""}`}
                                    >
                                        <div className={`flex justify-center ${isCollapsed ? "" : "w-[20%]"}`}>
                                            {item.icon && (
                                                <i className={`fa-solid ${item.icon} text-xl`} aria-hidden="true" />
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <div className="w-[75%] font-extralight">
                                                {item.menuName}
                                            </div>
                                        )}
                                    </Link>
                                )}

                                {/* Submenu — icon-only เมื่อ collapsed, full เมื่อ expanded */}
                                {hasSub && (
                                    <div
                                        id={`submenu-${item.id}`}
                                        role="region"
                                        aria-label={`submenu ของ ${item.menuName}`}
                                        className={`flex flex-col gap-1 overflow-hidden transition-all duration-200 ${isOpen ? "mt-1 max-h-96 opacity-100" : "max-h-0 opacity-0"
                                            } ${isCollapsed ? "" : "ml-10"}`}
                                    >
                                        {item.other_kaon_menu!.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                href={sub.path ?? "#"}
                                                aria-current={isActivePath(sub.path) ? "page" : undefined}
                                                title={isCollapsed ? sub.menuName : undefined}
                                                className={`rounded text-white/90 transition-colors duration-150 hover:bg-blue-700/60 flex items-center gap-2 ${isActivePath(sub.path) ? "bg-blue-700/70" : ""
                                                    } ${isCollapsed ? "justify-center py-1.5 px-2" : "text-sm px-2 py-1"}`}
                                            >
                                                {sub.icon && (
                                                    <i
                                                        className={`fa-solid ${sub.icon} ${isCollapsed ? "text-sm" : "text-sm"}`}
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                {!isCollapsed && sub.menuName}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </nav>

            {/* Profile */}
            {isLoading ? (
                <ProfileSkeleton collapsed={isCollapsed} />
            ) : isCollapsed ? (
                // Icon-only profile
                <div className="flex flex-col items-center gap-1 pb-1">
                    <div
                        className="w-10 h-10 flex justify-center items-center bg-white rounded-lg"
                        title={user?.username}
                    >
                        {user?.roles?.[0]?.icon ? (
                            <i className={`fa-solid ${user.roles[0].icon} text-xl text-blue-600`} aria-hidden="true" />
                        ) : (
                            <i className="fa-solid fa-user text-xl text-blue-300" aria-hidden="true" />
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        aria-label="ออกจากระบบ"
                        title="ออกจากระบบ"
                        className="w-10 h-7 flex items-center justify-center bg-white/90 rounded-lg text-blue-600 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoggingOut ? (
                            <i className="fa-solid fa-spinner fa-spin text-sm" aria-hidden="true" />
                        ) : (
                            <i className="fa-solid fa-right-from-bracket text-sm" aria-hidden="true" />
                        )}
                    </button>
                </div>
            ) : (
                // Full profile
                <div className="w-full h-15 p-2 bg-white rounded-[14px] flex gap-2 border border-[#B3E5FC]">
                    <div className="w-[20%] flex justify-center items-center bg-blue-50 rounded-lg">
                        {user?.roles?.[0]?.icon ? (
                            <i className={`fa-solid ${user.roles[0].icon} text-2xl text-blue-600`} aria-hidden="true" />
                        ) : (
                            <i className="fa-solid fa-user text-2xl text-blue-300" aria-hidden="true" />
                        )}
                    </div>
                    <div className="w-[55%] flex flex-col justify-center items-start gap-0.5">
                        <h1 className="font-main font-bold text-lg w-full truncate" title={user?.username}>
                            {user?.username ?? "ผู้ใช้งาน"}
                        </h1>
                        <p className="font-main text-xs w-full truncate text-gray-500" title={user?.roles?.[0]?.roleName}>
                            {user?.roles?.[0]?.roleName ?? "ไม่มีสิทธิ์"}
                        </p>
                    </div>
                    <div className="w-[20%] flex flex-col justify-center items-center gap-1">
                        <div className="flex gap-1 justify-between items-center w-full h-[60%]">
                            <button aria-label="ตั้งค่า">
                                <i className="fa-solid fa-gear" aria-hidden="true" />
                            </button>
                            <button aria-label="ตั้งค่า">
                                <i className="fa-solid fa-gear" aria-hidden="true" />
                            </button>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            aria-label="ออกจากระบบ"
                            className="btn-logout text-[12px] font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoggingOut ? (
                                <i className="fa-solid fa-spinner fa-spin text-[10px]" aria-hidden="true" />
                            ) : (
                                "logout"
                            )}
                        </button>
                    </div>
                </div>
            )}
        </aside>
    )
}