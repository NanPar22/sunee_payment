"use client"

import TableToggle, { RowData } from "@/app/components/layout/Table_Toggle"
import Dropdown from "@/app/components/ui/Dropdown"
import Search from "@/app/components/ui/Search"
import {  useEffect, useMemo, useState } from "react"

type RoleItem = {
    id: Int16Array;
    roleCode: string;
    roleName: string;
}

export default function Row() {
    const [keyword, setKeyword] = useState("")

    // server pagination
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)


    // data state
    // const [data, setData] = useState<Row[]>([])
    const [roledata, setRoledata] = useState<RoleItem[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [selectedRole, setSelectedRole] = useState<string>("All")

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/system/roles?page=1&pageSize=100")
            const json = await res.json()
            setRoledata(json.data)
        }
        fetchData()
    }, [])

    const roleOptions = useMemo(() => [
        "All",
        ...roledata.map((role) => role.roleName),
    ], [roledata])




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
        <div className="h-full p-2 flex flex-col gap-2 ">
            <div className="font-bold text-2xl">Tracking</div>

            <div className="flex  gap-4 ">
                <div>
                    <Search />
                </div>
                <div>
                    <Dropdown
                        className="w-32"
                        value={selectedRole}
                        options={roleOptions}
                        onChange={setSelectedRole}
                    />
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
