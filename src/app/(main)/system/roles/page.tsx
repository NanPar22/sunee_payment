"use client"

import BaseModal from "@/app/components/layout/BaseModel"
import { Table } from "@/app/components/layout/Table"
import { Pagination } from "@/app/components/ui/Pagination"
import Search from "@/app/components/ui/Search"
import { Toggle } from "@/app/components/ui/Toggle"
import { useTable } from "@/hooks/useTable"
import { useEffect, useMemo, useState } from "react"
import Swal from "sweetalert2"

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

    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRow, setEditingRow] = useState<Roles | null>(null)
    const [isAddMode, setIsAddMode] = useState(false)
    const [oldRow, setOldRow] = useState<Roles | null>(null)

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
    }, [page, pageSize, keyword, selectedStatus, refreshTrigger])

    // ================= ADD =================
    const handleAdd = () => {
        const emptyData: Roles = {
            id: 0,
            roleCode: "",
            roleName: "",
            description: "",
            isstatus: true,
        }

        setEditingRow({ ...emptyData })
        setOldRow(null)
        setIsAddMode(true)
        setIsModalOpen(true)
    }

    // ================= EDIT =================
    const handleEdit = (row: Roles) => {
        setIsAddMode(false)

        const Row = data.find(d => d.id === row.id) ?? row

        setEditingRow({ ...Row })
        setOldRow({ ...Row })
        setIsModalOpen(true)
    }

    // ================= DELETE =============
    const handleDelete = async (row: Roles | number) => {
        const id = typeof row === "number" ? row : row.id

        const confirm = await Swal.fire({
            title: "ยืนยันการลบ?",
            text: "ข้อมูลจะถูกปิดการใช้งาน",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก",
        })

        if (!confirm.isConfirmed) return

        try {
            const res = await fetch(`/api/system/roles/${id}`, {
                method: "DELETE",
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error)

            await Swal.fire("สำเร็จ!", "ลบข้อมูลเรียบร้อย", "success")
            setRefreshTrigger(prev => prev + 1)

        } catch (err: any) {
            Swal.fire("ผิดพลาด", err.message, "error")
        }
    }

    // ================= CHANGE CHECK =================
    const isChanged = useMemo(() => {
        if (isAddMode) return true
        if (!editingRow || !oldRow) return false

        return (
            editingRow.roleCode !== oldRow.roleCode ||
            editingRow.roleName !== oldRow.roleName ||
            editingRow.description !== oldRow.description ||
            editingRow.isstatus !== oldRow.isstatus
        )
    }, [editingRow, oldRow, isAddMode])

    const isSaveDisabled =
        !editingRow?.roleCode?.trim() ||
        !editingRow?.roleName?.trim() ||
        !isChanged

    // เพิ่ม error handling + success alert
    const handleSave = async () => {
        if (!editingRow) return

        const url = isAddMode
            ? "/api/system/roles"
            : `/api/system/roles/${editingRow.id}`

        const method = isAddMode ? "POST" : "PUT"

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editingRow,
                    roleCode: editingRow.roleCode.trim(),
                    roleName: editingRow.roleName.trim(),
                    description: editingRow.description?.trim(),
                }),
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || "บันทึกไม่สำเร็จ")
            await Swal.fire({
                title: "สำเร็จ!",
                text: "บันทึกข้อมูลเรียบร้อย",
                icon: "success",
                confirmButtonText: "ตกลง",
                customClass: {
                    popup: "swal-zindex"
                }
            })
            setIsModalOpen(false)
            setEditingRow(null)
            setOldRow(null)
            setRefreshTrigger(prev => prev + 1)

        } catch (error: any) {
            Swal.fire("เกิดข้อผิดพลาด", error.message || "บันทึกไม่สำเร็จ", "error")
        }
    }



    const table = useTable<Roles>({
        data,
        columns: [
            { key: "roleName", label: "Name" },
            { key: "roleCode", label: "Code" },
            { key: "description", label: "Description" },
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
            {
                key: "id",
                label: "Actions",
                render: (_, row: Roles) => (
                    <div className="flex justify-start items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(row)}
                                className="px-2 py-0.5 text-xs bg-yellow-300 text-yellow-900 hover:bg-yellow-500 hover:text-white rounded"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(row.id)}
                                className="px-2 py-0.5 text-xs bg-red-400 text-red-900 hover:bg-red-600 hover:text-white rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ),
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
                        <Search
                            onSearch={(v) => {
                                setKeyword(v)
                                setPage(1)
                            }}
                        />
                    </div>
                    {/* <Dropdown /> */}
                </div>
                <div className="flex items-center justify-center">
                    <button
                        onClick={handleAdd}
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

            {/* ================= MODAL ================= */}
            <BaseModal
                open={isModalOpen && !!editingRow}
                title={isAddMode ? "Add New Roles" : "Edit Roles"}
                onClose={() => { }}
                footer={
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => {
                                setIsModalOpen(false)
                                setEditingRow(null)
                                setOldRow(null)
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-red-200 hover:text-red-900 hover:border-red-200 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isSaveDisabled}

                            className={`px-4 py-2 rounded-md transition-colors ${isSaveDisabled
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                        >
                            {isAddMode ? "Create" : "Save"}
                        </button>
                    </div>
                }
            >
                {editingRow && (
                    <div className="space-y-4">

                        {/* Role Code */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">
                                Role Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editingRow.roleCode}
                                onChange={(e) =>
                                    setEditingRow({ ...editingRow, roleCode: e.target.value })
                                }
                                className="focus-input"
                                placeholder="Enter role code"
                            />
                        </div>

                        {/* Role Name */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">
                                Role Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editingRow.roleName}
                                onChange={(e) =>
                                    setEditingRow({ ...editingRow, roleName: e.target.value })
                                }
                                className="focus-input"
                                placeholder="Enter role name"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">
                                Description
                            </label>
                            <textarea
                                value={editingRow.description}
                                onChange={(e) =>
                                    setEditingRow({ ...editingRow, description: e.target.value })
                                }
                                className=" w-full text-gray-500 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>

                        {/* Status Toggle */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-600">
                                Status
                            </label>

                            <div className="flex items-center gap-3">
                                <Toggle
                                    value={editingRow.isstatus}
                                    onChange={(checked) =>
                                        setEditingRow({
                                            ...editingRow,
                                            isstatus: checked,
                                        })
                                    }
                                />
                                <span className="text-sm text-gray-600">
                                    {editingRow.isstatus ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <>
                </>
            </BaseModal>
        </div>
    )
}