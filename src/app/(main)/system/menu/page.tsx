"use client"

import { Table_Drop } from "@/app/components/layout/Table_drop"
import Dropdown from "@/app/components/ui/Dropdown"
import { Pagination } from "@/app/components/ui/Pagination"
import Search from "@/app/components/ui/Search"
import { Toggle } from "@/app/components/ui/Toggle"
import { useTable } from "@/hooks/useTable"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

type ChildRow = {
    id: number
    menuName: string
    isstatus: boolean
    path: string
    sortOrder: number
    icon: string
}

type Row = {
    id: number
    menuName: string
    isstatus: boolean
    path: string
    parentId: number | null
    sortOrder: number
    icon: string
    other_kaon_menu?: ChildRow[]
}

type TableRow = {
    id: number
    menuName: string
    path: string
    sortOrder: number
    icon: string
    parentId: number | null
    isstatus: string
    children?: TableRow[]
}

export default function Menu() {
    const [keyword, setKeyword] = useState("")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const [data, setData] = useState<TableRow[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<string>("")

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRow, setEditingRow] = useState<TableRow | null>(null)
    const [isAddMode, setIsAddMode] = useState(false)

    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [originalRow, setOriginalRow] = useState<TableRow | null>(null)


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

                const res = await fetch(`/api/system/menus?${params.toString()}`)
                if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")

                const json = await res.json()

                const mappedData: TableRow[] = json.data.map((parent: Row) => ({
                    id: parent.id,
                    menuName: parent.menuName,
                    path: parent.path,
                    sortOrder: parent.sortOrder,
                    icon: parent.icon,
                    parentId: parent.parentId, // ✅ เพิ่ม: parentId ของ parent
                    isstatus: parent.isstatus ? "Active" : "Inactive",
                    children: parent.other_kaon_menu?.map((child) => ({
                        id: child.id,
                        menuName: child.menuName,
                        path: child.path,
                        sortOrder: child.sortOrder,
                        icon: child.icon,
                        parentId: parent.id, // ✅ เพิ่ม: parentId ของ child
                        isstatus: child.isstatus ? "Active" : "Inactive",
                    })),
                }))

                setData(mappedData)
                setTotalPages(json.totalPages)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [page, pageSize, keyword, selectedStatus, refreshTrigger])

    const handleAdd = () => {
        setIsAddMode(true)
        setEditingRow({
            id: 0,
            menuName: "",
            path: "",
            parentId: null, // ✅ แก้ไข: เปลี่ยนจาก 0 เป็น null
            sortOrder: 0,
            icon: "",
            isstatus: "Active",
        })

        setOriginalRow(null) // 🔥 Add mode ไม่ต้องเทียบ
        setIsModalOpen(true)
    }

    const handleEdit = (row: TableRow) => {
        setIsAddMode(false)
        setEditingRow({ ...row })
        setOriginalRow({ ...row })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "ยืนยันการลบ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        })

        if (!result.isConfirmed) return

        try {
            const res = await fetch(`/api/system/menus/${id}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("ลบไม่สำเร็จ")

            Swal.fire("ลบสำเร็จ!", "", "success")
            setRefreshTrigger(prev => prev + 1)
        } catch {
            Swal.fire("เกิดข้อผิดพลาด", "", "error")
        }
    }
    const handleSave = async () => {
        if (!editingRow) return

        // Validation: ชื่อเมนู
        if (!editingRow.menuName || editingRow.menuName.trim() === "") {
            Swal.fire("กรุณาระบุชื่อเมนู", "", "warning")
            return
        }

        // ✅ Validation: path
        if (editingRow.path && !editingRow.path.trim().startsWith("/")) {
            Swal.fire("path ต้องขึ้นต้นด้วย /", "", "warning")
            return
        }

        // ✅ Validation: sortOrder
        if (editingRow.sortOrder !== undefined && editingRow.sortOrder < 0) {
            Swal.fire("ลำดับต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0", "", "warning")
            return
        }

        try {
            const payload = {
                menuName: editingRow.menuName.trim(),
                path: editingRow.path?.trim() || undefined,
                icon: editingRow.icon?.trim() || undefined,
                sortOrder: editingRow.sortOrder || undefined,
                isstatus: editingRow.isstatus === "Active",
                parentId: editingRow.parentId || null,
            }

            let res
            if (isAddMode) {
                res = await fetch(`/api/system/menus/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
            } else {
                res = await fetch(`/api/system/menus/edit/${editingRow.id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
            }

            // ✅ ตรวจสอบ HTTP status ก่อน
            if (!res.ok) {
                const result = await res.json()
                throw new Error(result.error || `HTTP Error: ${res.status}`)
            }

            const result = await res.json()

            // ✅ ตรวจสอบ success flag
            if (!result.success) {
                throw new Error(result.error || "บันทึกไม่สำเร็จ")
            }

            // 🔥 เอา focus ออกจากปุ่ม Save ก่อน
            ; (document.activeElement as HTMLElement)?.blur()

            // 🔥 ปิด modal ก่อน
            setIsModalOpen(false)
            setEditingRow(null)

            // 🔥 ค่อยเปิด Swal
            await Swal.fire(
                isAddMode ? "เพิ่มสำเร็จ!" : "แก้ไขสำเร็จ!",
                result.message,
                "success"
            )

            setRefreshTrigger(prev => prev + 1)


        } catch (error: any) {
            console.error("Error saving menu:", error)
            Swal.fire(
                "เกิดข้อผิดพลาด",
                error.message || "บันทึกไม่สำเร็จ",
                "error"
            )
        }
    }

    const isChanged = () => {
        if (isAddMode) return true
        if (!editingRow || !originalRow) return false

        return (
            editingRow.menuName !== originalRow.menuName ||
            editingRow.path !== originalRow.path ||
            editingRow.parentId !== originalRow.parentId ||
            editingRow.sortOrder !== originalRow.sortOrder ||
            editingRow.icon !== originalRow.icon ||
            editingRow.isstatus !== originalRow.isstatus
        )
    }


    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
    }, [isModalOpen])

    const table = useTable<TableRow>({
        data,
        columns: [
            { key: "menuName", label: "Name" },
            { key: "path", label: "Path" },
            { key: "icon", label: "Icon" },
            { key: "sortOrder", label: "SortOrder" },
            {
                key: "isstatus",
                label: "Status",
                render: (value) => {
                    const statusValue = typeof value === 'string' ? value : '';
                    return (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusValue === "Active"
                            ? "bg-green-200 text-green-700"
                            : "bg-gray-100 text-gray-600"
                            }`}>
                            {statusValue}
                        </span>
                    )
                }
            },
            {
                key: "id",
                label: "Actions",
                render: (_, row) => (
                    <div className="flex justify-start items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(row)}
                                className="px-2 py-0.5 text-xs bg-yellow-300 text-yellow-900 hover:bg-yellow-500 hover:text-white  rounded"
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
        <div className="h-full  p-4 flex flex-col gap-4">
            <div className="font-bold text-2xl">Menu Management</div>
            <div className="flex items-center justify-between  ">
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
                        value={
                            selectedStatus === "" ? "All" :
                                selectedStatus === "true" ? "Active" :
                                    selectedStatus === "false" ? "Inactive" : "All"
                        }
                        options={["All", "Active", "Inactive"]}
                        onChange={(value) => {
                            if (value === "All") {
                                setSelectedStatus("")
                            } else if (value === "Active") {
                                setSelectedStatus("true")
                            } else {
                                setSelectedStatus("false")
                            }
                            setPage(1)
                        }}
                        className="w-18"
                    />
                </div>
                <div className="flex items-center justify-center  ">
                    <button
                        onClick={handleAdd}
                        className="border px-2 h-6 rounded-sm flex justify-center items-center gap-1 text-blue-500 hover:bg-blue-500/10  "
                    >
                        <i className="fa-solid fa-plus text-xs"></i>
                        <div className="text-sm ">
                            Add
                        </div>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    {loading && <div className="text-center py-10">Loading...</div>}
                    {error && <div className="text-center text-red-500">{error}</div>}
                    {!loading && !error && <Table_Drop table={table} />}
                </div>

                <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
            </div>


            {isModalOpen && editingRow && (
                <div
                    className="modal-overlay"
                    onClick={() => {
                        setIsModalOpen(false)
                        setEditingRow(null)
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                            {isAddMode ? "Add New Menu" : "Edit Menu"}
                        </h2>

                        <div className="space-y-4">
                            {/* Menu Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Menu Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editingRow.menuName}
                                    onChange={(e) => setEditingRow({ ...editingRow, menuName: e.target.value })}
                                    className="w-full text-gray-500  border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter menu name"
                                />
                            </div>

                            {/* Path */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Path <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editingRow.path}
                                    onChange={(e) => setEditingRow({ ...editingRow, path: e.target.value })}
                                    className="w-full text-gray-500  border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="/example"
                                />
                            </div>

                            {/* Parent ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Parent ID
                                </label>
                                <input
                                    type="number"
                                    value={editingRow.parentId ?? ""}
                                    onChange={(e) =>
                                        setEditingRow({
                                            ...editingRow,
                                            parentId: e.target.value === "" ? null : Number(e.target.value)
                                        })
                                    }
                                    className="w-full text-gray-500 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Leave empty for main menu"
                                    min="1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave empty for Main Menu or enter parent menu ID for Sub Menu
                                </p>
                            </div>

                            {/* Icon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Icon
                                </label>
                                <input
                                    type="text"
                                    value={editingRow.icon || ""}
                                    onChange={(e) => setEditingRow({ ...editingRow, icon: e.target.value })}
                                    className="w-full text-gray-500 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="fa-house"
                                />
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    value={editingRow.sortOrder}
                                    onChange={(e) => setEditingRow({ ...editingRow, sortOrder: Number(e.target.value) })}
                                    className="w-full text-gray-500  border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            {/* Status - Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <div className="flex items-center gap-3">
                                    <Toggle
                                        value={editingRow.isstatus === "Active"}
                                        onChange={(checked) =>
                                            setEditingRow({
                                                ...editingRow,
                                                isstatus: checked ? "Active" : "Inactive"
                                            })
                                        }
                                    />
                                    <span className="text-sm text-gray-600">
                                        {editingRow.isstatus === "Active" ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 mt-6 justify-end">
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
                                disabled={
                                    !editingRow?.menuName ||
                                    editingRow.menuName.trim() === "" ||
                                    !isChanged()
                                }
                                className={`px-4 py-2 rounded-md transition-colors
                                  ${!editingRow?.menuName ||
                                        editingRow.menuName.trim() === "" ||
                                        !isChanged()
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-500 text-white hover:bg-blue-600"
                                    }
                                    `}
                            >
                                {isAddMode ? "Create" : "Save"}
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}