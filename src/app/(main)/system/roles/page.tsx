"use client"

import { Table } from "@/app/components/layout/Table"
import Dropdown from "@/app/components/ui/Dropdown"
import { Pagination } from "@/app/components/ui/Pagination"
import Search from "@/app/components/ui/Search"
import { useTable } from "@/hooks/useTable"
import { useEffect, useState } from "react"

type Roles = {
    id: number;
    roleCode: string;
    roleName: string;
    isstatus: boolean;
    description: string;
}

export default function Roles() {
    const [keyword, setKeyword] = useState("")
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<string>("")

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const [isModalOpen, setIsModalOpen] = useState(false)
    // const [editingRow, setEditingRow] = useState<User | null>(null)
    const [isAddMode, setIsAddMode] = useState(false)

    const [data, setData] = useState<Roles[]>([])
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const params = new URLSearchParams({
                    page: page.toString(),
                    pageSize: pageSize.toString(),
                })

                if (keyword) params.set("search", keyword)
                if (selectedStatus !== "") {
                    params.set("status", selectedStatus)
                }

                const res = await fetch(`/api/system/roles?${params.toString()}`)
                if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")

                const json = await res.json()

                setData(Array.isArray(json.data) ? json.data : [])
                setTotalPages(json.totalPages ?? 1)

            } catch (error: any) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [page, pageSize, keyword, selectedStatus])


    const table = useTable<Roles>({
        data,
        columns: [
            { key: "roleName", label: "Name" },
            { key: "roleCode", label: "Code" },
            { key: "description", label: "Code" },
            {
                key: "isstatus",
                label: "Status",
                render: (value) => {
                    const statusValue = value ? "Active" : "Inactive"

                    return (
                        <span
                            className={`px-2 py-1 rounded text-xs font-medium ${value
                                ? "bg-green-200 text-green-700"
                                : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            {statusValue}
                        </span>
                    )
                }

            },
        ],
        page,
        pageSize,
        totalPages,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
    })


    return (
        <div className="h-full p-2 flex flex-col gap-4">
            <div className="font-bold text-2xl text-blue-600 ">Roles Management</div>
            <div className="flex justify-between items-center gap-2 ">
                <div className="flex items-center gap-2">
                    <div className="w-80">
                        <Search />
                    </div>
                    {/* <Dropdown /> */}
                </div>
                <div className="flex items-center justify-center">
                    <button
                        // onClick={handleAdd}
                        className="border px-2 h-6 rounded-sm flex justify-center items-center gap-1 text-blue-500 hover:bg-blue-500/10"
                    >
                        <i className="fa-solid fa-plus text-xs"></i>
                        <div className="text-sm">Add</div>
                    </button>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    {loading && <div className="text-center py-10">Loading...</div>}
                    {error && <div className="text-center text-red-500">{error}</div>}
                    {!loading && !error && <Table table={table} />}
                </div>

                <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
            </div>
        </div>
    )
}