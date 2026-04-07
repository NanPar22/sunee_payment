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
    icon: string;
}

type PermissionRow = {
    menuId: number;
    menuName: string;
    permissions: number[];
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

    // ================= PERMISSION STATE =================
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
    const [permissionRole, setPermissionRole] = useState<Roles | null>(null)
    const [permissions, setPermissions] = useState<PermissionRow[]>([])
    const [permissionLoading, setPermissionLoading] = useState(false)
    const [permissionChanged, setPermissionChanged] = useState(false)

    const [openActionId, setOpenActionId] = useState<number | null>(null)

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
            icon: "",
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

    // ================= PERMISSION =================
    const handlePermission = async (row: Roles) => {
        setPermissionRole(row)
        setPermissionLoading(true)
        setPermissionChanged(false)
        setIsPermissionModalOpen(true)

        try {
            const res = await fetch(`/api/system/roles/permission?roleId=${row.id}`)
            if (!res.ok) throw new Error("โหลด permission ไม่สำเร็จ")
            const data = await res.json()
            setPermissions(data)
        } catch (err: any) {
            Swal.fire("ผิดพลาด", err.message, "error")
            setIsPermissionModalOpen(false)
        } finally {
            setPermissionLoading(false)
        }
    }

    const handleSavePermissions = async () => {
        if (!permissionRole) return
        try {
            const res = await fetch(`/api/system/roles/permission`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleId: permissionRole.id, permissions }),
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || "บันทึกไม่สำเร็จ")
            await Swal.fire({
                title: "สำเร็จ!",
                text: "บันทึกข้อมูลเรียบร้อย",
                icon: "success",
                confirmButtonText: "ตกลง",
                customClass: { popup: "swal-zindex" }
            })
            setIsPermissionModalOpen(false)
            setPermissions([])
            setPermissionRole(null)
        } catch (err: any) {
            Swal.fire("ผิดพลาด", err.message, "error")
        }
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
            editingRow.isstatus !== oldRow.isstatus ||
            editingRow.icon !== oldRow.icon
        )
    }, [editingRow, oldRow, isAddMode])

    const isSaveDisabled =
        !editingRow?.roleCode?.trim() ||
        !editingRow?.roleName?.trim() ||
        !isChanged

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
                customClass: { popup: "swal-zindex" }
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
            {
                key: "roleName",
                label: "Name",
                render: (value, row: Roles) => (
                    <div className="flex items-center gap-2">
                        {row.icon
                            ? <i className={`fa-solid ${row.icon} text-blue-600 w-4`} />
                            : <i className="fa-solid fa-shield text-gray-300 w-4" />
                        }
                        <span>{value}</span>
                    </div>
                )
            },
            { key: "roleCode", label: "Code" },
            { key: "description", label: "Description" },

            {
                key: "isstatus",
                label: "Status",
                render: (value) => {
                    const statusValue = value ? "Active" : "Inactive"
                    return (
                        <div className="flex items-center max-lg:justify-center gap-2">
                            {/* Mobile: แสดงเฉพาะไอคอน */}
                            <div className="lg:hidden">
                                <i className={`fa-solid fa-circle text-xs ${value ? "text-green-500" : "text-gray-400"}`}></i>
                            </div>

                            {/* Desktop: แสดง status text */}
                            <span
                                className={`px-2 py-1 rounded text-xs font-medium hidden lg:inline ${value
                                    ? "bg-green-200 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                    }`}
                            >
                                {statusValue}
                            </span>
                        </div>
                    )
                }
            },
            {
                key: "id",
                label: "Actions",
                render: (_, row: Roles) => (
                    <div className="flex justify-start items-center">
                        {/* Desktop */}
                        <div className="hidden sm:flex gap-2">
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
                            <button
                                onClick={() => handlePermission(row)}
                                className="px-2 py-0.5 text-xs bg-blue-400 text-blue-900 hover:bg-blue-600 hover:text-white rounded"
                            >
                                Permission
                            </button>
                        </div>
                        {/* Mobile */}
                        <div className="sm:hidden">
                            <button
                                onClick={() => setOpenActionId(openActionId === row.id ? null : row.id)}
                                className="px-2 py-1 text-lg text-gray-600 hover:bg-gray-100 rounded"

                            >
                                <i className="fa-solid fa-ellipsis-v"></i>
                            </button>

                            {openActionId === row.id && (
                                <>
                                    <div className="fixed inset-0  z-30" onClick={() => setOpenActionId(null)} />
                                    <div className="absolute right-2  space-y-1  bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-1 flex flex-col justify-center">
                                        <button
                                            onClick={() => { handleEdit(row); setOpenActionId(null) }}
                                            className="px-2 py-0.5 text-xs bg-yellow-300 text-yellow-900 hover:bg-yellow-500 hover:text-white rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => { handleDelete(row.id); setOpenActionId(null) }}
                                            className="px-2 py-0.5 text-xs bg-red-400 text-red-900 hover:bg-red-600 hover:text-white rounded"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => { handlePermission(row); setOpenActionId(null) }}
                                            className="px-2 py-0.5 text-xs bg-blue-400 text-blue-900 hover:bg-blue-600 hover:text-white rounded"
                                        >
                                            Permission
                                        </button>
                                    </div>
                                </>
                            )}
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
            <div className="font-bold text-2xl text-blue-600  max-lg:text-center xl:text-left ">Roles Management</div>
            <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-80 max-lg:w-60 ">
                        <Search
                            onSearch={(v) => {
                                setKeyword(v)
                                setPage(1)
                            }}
                        />
                    </div>
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

            {/* ================= EDIT / ADD MODAL ================= */}
            <BaseModal
                open={isModalOpen}
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

                        {/* Icon */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">
                                Icon <span className="text-xs text-gray-400">(Font Awesome class)</span>
                            </label>
                            <div className="flex gap-2 items-center">
                                <div className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-md bg-gray-50 text-blue-500">
                                    {editingRow.icon
                                        ? <i className={`fa-solid ${editingRow.icon} text-lg`} />
                                        : <i className="fa-solid fa-shield text-gray-300 text-lg" />
                                    }
                                </div>
                                <input
                                    type="text"
                                    value={editingRow.icon}
                                    onChange={(e) =>
                                        setEditingRow({ ...editingRow, icon: e.target.value })
                                    }
                                    className="focus-input flex-1"
                                    placeholder="fa-shield, fa-user-shield, fa-key ..."
                                />
                            </div>
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
                                className="w-full text-gray-500 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        setEditingRow({ ...editingRow, isstatus: checked })
                                    }
                                />
                                <span className="text-sm text-gray-600">
                                    {editingRow.isstatus ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </BaseModal>

            {/* ================= PERMISSION MODAL ================= */}
            <BaseModal
                open={isPermissionModalOpen}
                title={`Permissions — ${permissionRole?.roleName ?? ""}`}
                onClose={() => { }}
                footer={
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => {
                                setIsPermissionModalOpen(false)
                                setPermissions([])
                                setPermissionRole(null)
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-red-200 hover:text-red-900 hover:border-red-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSavePermissions}
                            disabled={!permissionChanged}
                            className={`px-4 py-2 rounded-md transition-colors ${!permissionChanged
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                        >
                            Save
                        </button>
                    </div>
                }
            >
                {permissionLoading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse ">
                            <thead>
                                <tr className="bg-blue-100 text-gray-600  ">
                                    <th className="text-left px-3 py-2 font-medium">Menu</th>
                                    {["View", "Add", "Edit", "Delete", "Status"].map(h => (
                                        <th key={h} className="px-3 py-2 font-medium text-center">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {permissions.map((perm, idx) => (
                                    <tr key={perm.menuId} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/50"}>
                                        <td className="px-3 py-2 text-gray-700">{perm.menuName}</td>

                                        {/* ✅ แก้ตรงนี้ */}
                                        {[
                                            { id: 1, key: "isview" },
                                            { id: 2, key: "isadd" },
                                            { id: 3, key: "isedit" },
                                            { id: 4, key: "isdelete" },
                                            { id: 5, key: "isstatus" },
                                        ].map(({ id, key }) => (
                                            <td key={key} className="px-3 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={perm.permissions.includes(id)}
                                                    onChange={(e) => {
                                                        setPermissions(prev =>
                                                            prev.map(p =>
                                                                p.menuId === perm.menuId
                                                                    ? {
                                                                        ...p,
                                                                        permissions: e.target.checked
                                                                            ? [...p.permissions, id]
                                                                            : p.permissions.filter(x => x !== id)
                                                                    }
                                                                    : p
                                                            )
                                                        )
                                                        setPermissionChanged(true)
                                                    }}
                                                    className="w-4 h-4 cursor-pointer accent-blue-500"
                                                />
                                            </td>
                                        ))}

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </BaseModal>
        </div>
    )
}
