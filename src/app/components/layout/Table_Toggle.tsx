"use client"

import { useState } from "react"
import { Toggle } from "../ui/Toggle"

type PermissionKey = "view" | "add" | "edit" | "delete"

export type RowData = {
    id: number
    name: string
} & Record<PermissionKey, boolean>

type TableToggleProps = {
    headers: string[]
    initialData: RowData[]
}

export default function TableToggle({ headers, initialData }: TableToggleProps) {
    const [data, setData] = useState<RowData[]>(initialData)

    const permissionKeys: PermissionKey[] = ["view", "add", "edit", "delete"]

    const toggle = (id: number, key: PermissionKey) => {
        setData(prev =>
            prev.map(row =>
                row.id === id ? { ...row, [key]: !row[key] } : row
            )
        )
    }

    return (
        <div className="h-full w-full bg-white rounded-lg overflow-auto shadow-sm">
            <table className="w-full">
                <thead className="bg-blue-600 text-white sticky top-0">
                    <tr>
                        {headers.map(h => (
                            <th
                                key={h}
                                className={`px-3 py-2 font-semibold ${
                                    h === "Menu" ? "text-left" : "text-center"
                                }`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.map((row, index) => (
                        <tr
                            key={row.id}
                            className={`hover:bg-gray-100 ${
                                index % 2 === 0 ? "bg-white" : "bg-blue-50"
                            } ${
                                index !== data.length - 1 ? "border-b border-gray-200" : ""
                            }`}
                        >
                            <td className="px-3 py-2 text-left text-black border-r border-gray-200">
                                {row.name}
                            </td>

                            {permissionKeys.map(key => (
                                <td key={key} className="px-3 py-2 border-r border-gray-200 last:border-r-0">
                                    <div className="flex items-center justify-center">
                                        <Toggle
                                            value={row[key]}
                                            onChange={() => toggle(row.id, key)}
                                        />
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}