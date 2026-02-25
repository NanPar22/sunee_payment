"use client"

import { Table } from "@/app/components/layout/Table"
import Dropdown from "@/app/components/ui/Dropdown"
import { Pagination } from "@/app/components/ui/Pagination"
import Search from "@/app/components/ui/Search"
import { useTable } from "@/hooks/useTable"
import { useEffect, useMemo, useState } from "react"
import Swal from "sweetalert2"
import { Toggle } from "@/app/components/ui/Toggle"
import BaseModal from "@/app/components/layout/BaseModel"
import Dropdown_Input from "@/app/components/ui/Dropdown_Input" 

type RoleItem = {
    id: number
    roleCode: string
    roleName: string
}

type User = {
    id: number
    spid: string
    username: string
    roleId: number
    role: string
    status: string
}

export default function User() {
    const [keyword, setKeyword] = useState("")
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const [data, setData] = useState<User[]>([])
    const [roledata, setRoledata] = useState<RoleItem[]>([])
    const [selectedRole, setSelectedRole] = useState<string>("All")

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRow, setEditingRow] = useState<User | null>(null)
    const [isAddMode, setIsAddMode] = useState(false)

    const [refreshTrigger, setRefreshTrigger] = useState(0)

    /* =========================
        โหลด Role
    ========================= */
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await fetch("/api/system/roles?page=1&pageSize=100")
                const json = await res.json()
                setRoledata(json.data || [])
            } catch (err) {
                console.error(err)
            }
        }

        fetchRoles()
    }, [])

    // useMemo ป้องกันสร้างใหม่ทุก render
    const roleOptions = useMemo(() => [
        "All",
        ...roledata.map((role) => role.roleName),
    ], [roledata])

    /* =========================
        โหลด Users
    ========================= */
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                setError(null)

                const searchParam = keyword
                    ? `&search=${encodeURIComponent(keyword)}`
                    : ""

                const roleParam = selectedRole !== "All"
                    ? `&role=${encodeURIComponent(selectedRole)}`
                    : ""

                const res = await fetch(
                    `/api/system/users?page=${page}&pageSize=${pageSize}${searchParam}${roleParam}`
                )

                const json = await res.json()

                setData(json.items || [])
                setTotalPages(json.totalPages || 1)
            } catch (err) {
                setError("Failed to fetch users")
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [selectedRole, page, pageSize, keyword, refreshTrigger])

    const displayData = data.map(row => ({
        ...row,
        status: row.status === "Y" ? "Active" : "Inactive"
    }))

    const handleAdd = () => {
        setIsAddMode(true)
        setEditingRow({
            id: 0,
            spid: "",
            username: "",
            roleId: 0,
            role: "",
            status: "Y",
        })
        setIsModalOpen(true)
    }

    const handleEdit = (row: User) => {
        setIsAddMode(false)
        // ดึงจาก raw data เพื่อให้ status เป็น "Y"/"N" ไม่ใช่ "Active"/"Inactive"
        const rawRow = data.find(d => d.id === row.id) ?? row
        setEditingRow(rawRow)
        setIsModalOpen(true)
    }

    const handleDelete = async (row: any, hardDelete = false) => {
        const id = Number(row?.id ?? row)

        if (!Number.isInteger(id) || id <= 0) {
            Swal.fire("ID ไม่ถูกต้อง", "", "error")
            return
        }

        const confirm = await Swal.fire({
            title: hardDelete ? "ยืนยันการลบถาวร?" : "ยืนยันการลบ?",
            text: hardDelete ? "ข้อมูลจะถูกลบถาวร" : "ข้อมูลจะถูกปิดการใช้งาน",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก",
        })

        if (!confirm.isConfirmed) return

        try {
            const res = await fetch(
                `/api/system/users/${id}${hardDelete ? "?hard=true" : ""}`,
                { method: "DELETE" }
            )

            const result = await res.json()

            if (!res.ok || !result.success) {
                throw new Error(result.error || "ลบไม่สำเร็จ")
            }

            await Swal.fire("สำเร็จ!", result.message, "success")
            setRefreshTrigger(prev => prev + 1)

        } catch (error: any) {
            Swal.fire("เกิดข้อผิดพลาด", error.message || "ลบไม่สำเร็จ", "error")
        }
    }

    // เพิ่ม error handling + success alert
    const handleSave = async () => {
        if (!editingRow) return

        const url = isAddMode
            ? "/api/system/users"
            : `/api/system/users/${editingRow.id}`

        const method = isAddMode ? "POST" : "PUT"

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingRow),
            })
            setIsModalOpen(false)
            const result = await res.json()


            if (!res.ok) throw new Error(result.error || "บันทึกไม่สำเร็จ")

            await Swal.fire("สำเร็จ!", "บันทึกข้อมูลเรียบร้อย", "success")
            setEditingRow(null)
            setRefreshTrigger(prev => prev + 1)

        } catch (error: any) {
            Swal.fire("เกิดข้อผิดพลาด", error.message || "บันทึกไม่สำเร็จ", "error")
        }
    }

    // แยก disabled condition ออกมาเพื่อลดความซ้ำซ้อน
    const isSaveDisabled = !editingRow?.spid?.trim() || !editingRow?.username?.trim()

    const table = useTable<User>({
        data: displayData,
        columns: [
            { key: "spid", label: "ID" },
            { key: "username", label: "Username" },
            { key: "role", label: "Role" },
            {
                key: "status",
                label: "Status",
                render: (value, row) => {
                    const statusValue = (row?.status ?? value ?? "") as string
                    const isActive = statusValue === "Active"
                    return (
                        <span
                            className={`px-2 py-1 rounded text-xs font-medium ${isActive
                                ? "bg-green-200 text-green-700"
                                : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    )
                },
            },
            {
                key: "id",
                label: "Actions",
                render: (_, row: User) => (
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
            <div className="font-bold text-blue-600 text-2xl">
                User Management
            </div>

            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-80">
                        <Search
                            onSearch={(v) => {
                                setKeyword(v)
                                setPage(1)
                            }}
                        />
                    </div>

                    <Dropdown
                        value={selectedRole}
                        options={roleOptions}
                        onChange={setSelectedRole}
                        className="w-32"
                    />
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
                title={isAddMode ? "Add New User" : "Edit User"}
                onClose={() => { }}
                footer={
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => {
                                setIsModalOpen(false)
                                setEditingRow(null)
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-red-200 hover:text-red-900 hover:border-red-200 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSave}

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

                        {/* SPID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                SPID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editingRow.spid}
                                onChange={(e) =>
                                    setEditingRow({ ...editingRow, spid: e.target.value })
                                }
                                className="w-full text-gray-500 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter SPID"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editingRow.username}
                                onChange={(e) =>
                                    setEditingRow({ ...editingRow, username: e.target.value })
                                }
                                className="w-full text-gray-500 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter username"
                            />
                        </div>

                        {/* Role Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <Dropdown_Input
                                options={roledata.map(r => ({
                                    label: r.roleName,
                                    value: r.id
                                }))}
                                value={editingRow.roleId}
                                onChange={(val) =>
                                    setEditingRow({ ...editingRow, roleId: Number(val) })
                                }
                            />

                        </div>

                        {/* Status Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>

                            <div className="flex items-center gap-3">
                                <Toggle
                                    value={editingRow.status === "Y"}
                                    onChange={(checked) =>
                                        setEditingRow({
                                            ...editingRow,
                                            status: checked ? "Y" : "N",
                                        })
                                    }
                                />
                                <span className="text-sm text-gray-600">
                                    {editingRow.status === "Y" ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>

                    </div>
                )}
            </BaseModal>
        </div>
    )
}