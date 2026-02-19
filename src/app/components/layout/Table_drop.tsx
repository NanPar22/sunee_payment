"use client"

import { useState, Fragment } from "react"
import Swal from "sweetalert2"

type TableProps<T extends { id: number }> = {
    table: {
        columns: {
            key: keyof T
            label: string
            sortable?: boolean
            render?: (value: T[keyof T], row: T) => React.ReactNode
        }[]
        data: (T & { children?: T[] })[]
        onSort: (key: keyof T) => void
        sortKey: keyof T | null
        sortOrder: "asc" | "desc"
    }
}

export function Table_Drop<T extends { id: number }>({ table }: TableProps<T>) {
    const { columns, data, onSort, sortKey, sortOrder } = table
    const [openRows, setOpenRows] = useState<number[]>([])

    const toggleRow = (id: number) => {
        setOpenRows(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        )
    }

    return (
        <div className="h-full overflow-y-auto rounded-lg shadow-sm">
            <table className="w-full border-collapse table-fixed">
                <thead className="bg-blue-600 sticky top-0">
                    <tr>
                        {columns.map(col => (
                            <th
                                key={String(col.key)}
                                onClick={() => col.sortable && onSort(col.key)}
                                className={`px-2 py-2 text-left text-white ${col.sortable ? "cursor-pointer" : ""
                                    }`}
                            >
                                <span className="flex items-center gap-1">
                                    {col.label}
                                    {col.sortable}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-6 text-center text-gray-500"
                            >
                                ไม่พบข้อมูล
                            </td>
                        </tr>
                    ) : (
                        data.map((row, i) => {
                            const isOpen = openRows.includes(row.id)
                            const hasChildren = row.children && row.children.length > 0

                            return (
                                <Fragment key={row.id}>
                                    <tr className={`text-black hover:bg-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-blue-50"
                                        }`}>
                                        {columns.map(col => {
                                            const key = String(col.key)
                                            const value = row[col.key]

                                            return (
                                                <td key={key} className="px-2 py-1.5">
                                                    {col.key === "menuName" && hasChildren ? (
                                                        <div className="flex items-center gap-2">
                                                            {col.render
                                                                ? col.render(value, row)
                                                                : String(value ?? "")}

                                                            <button
                                                                onClick={() => toggleRow(row.id)}
                                                                className="text-sm flex justify-center items-center px-1 py-0.5 rounded-sm  hover:bg-blue-100 "
                                                            >
                                                                {isOpen ? (
                                                                    <i className="fa-solid fa-caret-down"></i>
                                                                ) : (
                                                                    <i className="fa-solid fa-caret-right"></i>
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        col.render
                                                            ? col.render(value, row)
                                                            : String(value ?? "")
                                                    )}
                                                </td>
                                            )
                                        })}
                                    </tr>

                                    {isOpen && hasChildren && (
                                        <tr>
                                            <td colSpan={columns.length} className="p-0">
                                                <table className="w-full table-fixed">
                                                    <tbody>
                                                        {row.children?.map(child => (
                                                            <tr key={child.id} className="bg-blue-50/50 hover:bg-blue-100 text-gray-700">
                                                                {columns.map(col => {
                                                                    const key = String(col.key)
                                                                    const value = child[col.key]
                                                                    return (
                                                                        <td
                                                                            key={key}
                                                                            className={`px-2 py-1.5 ${col.key === "menuName" ? "pl-10" : ""
                                                                                }`}
                                                                        >
                                                                            {col.render
                                                                                ? col.render(value, child)
                                                                                : String(value ?? "")}
                                                                        </td>
                                                                    )
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    )
}