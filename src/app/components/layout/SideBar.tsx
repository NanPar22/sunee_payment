'use client'

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export default function Sidebar() {
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        })
        router.push("/login")
    }

    const menu = [
        {
            name: "Dashboard",
            href: "/",
            icon: "fa-house",
            drop: ""
        },
        {
            name: "Reports",
            href: "/report/info",
            icon: "fa-file-lines",
            drop: ""
        },
        {
            name: "Users",
            href: "/user",
            icon: "fa-users",
            drop: ""
        },
    ]

    return (
        <aside className="h-screen w-64 bg-linear-to-br from-blue-400 to-blue-600  px-2 pt-2  rounded-r-3xl shadow-sidebar font-main flex flex-col gap-0.5">

            {/* Profile */}
            <div className=" w-full h-15 p-2 bg-white rounded-[14px] flex gap-2 border border-[#B3E5FC] "  >
                <div className="w-[25%] flex justify-center items-center object-cover ">
                    <img src="https://freesvg.org/img/abstract-user-flat-3.png" alt="" className="h-10 w-10 object-cover" />
                </div>
                <div className="w-[55%] flex flex-col justify-center items-start gap-0.5">
                    <h1 className="font-main font-bold text-lg w-full">John Doe</h1>
                    <p className="font-main text-xs w-full">Admin</p>
                </div>
                <div className=" w-[20%] flex flex-col justify-center items-center gap-1">
                    <div className="flex gap-1 justify-between items-center  w-full h-[60%]  ">
                        <i className="fa-solid fa-bell "></i>
                        <i className="fa-solid fa-gear"></i>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn-logout text-[12px] font-sans">
                        logout
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-0.5 bg-[#B3E5FC] my-2 rounded-full" />

            {/* Menu */}
            {menu.map((item) => {
                const active = pathname === item.href

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`w-full rounded-sm py-1 px-2 flex gap-1 items-center text-white
              ${active ? "bg-blue-800/60" : "hover:bg-blue-800/60"}`}
                    >
                        <div className="w-[20%] flex justify-center">
                            <i className={`fa-solid ${item.icon} text-2xl`} />
                        </div>

                        <div className="w-[75%] font-semibold">
                            {item.name}
                        </div>

                        <div className="w-[5%] flex justify-center">
                            <i className="fa-solid fa-caret-right text-xl  transform transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>
                )
            })}
        </aside>
    )
}
