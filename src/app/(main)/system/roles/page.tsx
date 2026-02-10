"use client"

import TableToggle, { RowData } from "@/app/components/layout/Table_Toggle"
import Dropdown from "@/app/components/ui/Dropdown"
import Search from "@/app/components/ui/Search"

export default function Row() {

    const permissionsData: RowData[] = [
        {
            id: 1,
            name: "User Management",
            view: true,
            add: false,
            edit: false,
            delete: false,
        },
        {
            id: 2,
            name: "Report",
            view: true,
            add: true,
            edit: false,
            delete: false,
        },
        {
            id: 3,
            name: "Dashboard",
            view: true,
            add: true,
            edit: true,
            delete: false,
        },
    ]
    return (
        <div className="h-full p-2 flex flex-col gap-2 bg-amber-300">
            <div className="font-bold text-2xl">Tracking</div>

            <div className="flex  gap-4 ">
                <div>
                    <Search />
                </div>
                <div>
                    <Dropdown
                        className="w-20"
                        value="All" options={["All", "Admin", "User"]} />
                </div>
            </div>
            <div className="w-full h-full flex flex-col ">
                <div className=" h-full w-full ">
                    <TableToggle headers={["Menu", "View", "Add", "Edit", "Delete"]}
                        initialData={permissionsData}
                    />
                </div>
            </div>
        </div>
    )
}   