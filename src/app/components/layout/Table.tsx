// components/Table.tsx

import { Pagination } from "../ui/Pagination"

type TableProps<T> = {
    table: {
        columns: {
            key: keyof T
            label: string
            sortable?: boolean
        }[]
        data: T[]
        page: number
        pageSize: number
        totalPages: number
        setPage: (page: number) => void
        setPageSize: (size: number) => void
        onSort: (key: keyof T) => void
        sortKey: keyof T | null
        sortOrder: "asc" | "desc"
    }
}

export function Table<T extends object>({ table }: TableProps<T>) {
    const {
        columns,
        data,
        page,
        pageSize,
        totalPages,
        setPage,
        setPageSize,
        onSort,
        sortKey,
        sortOrder,
    } = table

    console.log("TABLE RENDER", { page, totalPages }) // 👈 เพิ่ม

    return (
        <div className="space-y-4 flex flex-col  justify-between h-full    ">
            <table className="w-full  bg-amber-400  rounded-lg shadow-sm overflow-hidden    ">
                <thead className="bg-blue-600   ">
                    <tr>
                        {columns.map(col => (
                            <th
                                key={String(col.key)}
                                onClick={() => col.sortable && onSort(col.key)}
                                className={`px-4 py-2 text-left ${col.sortable ? "cursor-pointer" : ""
                                    }`}
                            >
                                <span className="flex items-center gap-1">
                                    {col.label}

                                    {col.sortable && (
                                        <span className="inline-block w-4 text-center text-xs opacity-70">
                                            {sortKey === col.key
                                                ? sortOrder === "asc"
                                                    ? "▲"
                                                    : "▼"
                                                : "▲▼"}
                                        </span>
                                    )}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="">
                    {data.map((row, i) => (
                        <tr key={i} className={`  text-black hover:bg-gray-50 px-1  ${i % 2 === 0 ? "bg-white" : "bg-blue-50"}`}>
                            {columns.map(col => (
                                <td key={String(col.key)} className="px-4 py-1.5">
                                    {String(row[col.key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <Pagination
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
            />
        </div>
    )
}
