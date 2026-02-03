// components/Table.tsx

type TableProps<T> = {
    table: {
        columns: {
            key: keyof T
            label: string
            sortable?: boolean
        }[]
        data: T[]
        onSort: (key: keyof T) => void
        sortKey: keyof T | null
        sortOrder: "asc" | "desc"
    }
}

export function Table<T extends object>({ table }: TableProps<T>) {
    const { columns, data, onSort, sortKey, sortOrder } = table

    console.log("TABLE RENDER") // ยัง debug ได้ตามปกติ

    return (
        <div className="space-y-4 h-full overflow-y-auto rounded-lg shadow-sm ">
            <table className="w-full bg-amber-400  ">
                <thead className="bg-blue-600  ">
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

                <tbody>
                    {data.map((row, i) => (
                        <tr
                            key={i}
                            className={`text-black hover:bg-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-blue-50"
                                }`}
                        >
                            {columns.map(col => (
                                <td key={String(col.key)} className="px-4 py-1.5">
                                    {String(row[col.key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
