// components/Table.tsx

import Swal from "sweetalert2"

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

    const openTextModal = (title: string, value?: unknown) => {
        const text = String(value ?? "ไม่มีข้อมูล")

        Swal.fire({
            title,
            html: `
      <pre style="text-align:left;white-space:pre-wrap;max-height:300px;overflow:auto;">
            ${text}
      </pre>
    `,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "📋 Copy",
            cancelButtonText: "ปิด",
        }).then(result => {
            if (result.isConfirmed) {
                navigator.clipboard.writeText(text)
                Swal.fire({
                    icon: "success",
                    title: "คัดลอกแล้ว",
                    timer: 1200,
                    showConfirmButton: false,
                })
            }
        })
    }

    const getRespMsgClass = (val?: unknown) => {
        const text = String(val ?? "").toLowerCase()

        if (text === "pending") return "text-yellow-600 bg-yellow-100/50"
        if (text === "successful") return "text-green-600 bg-green-100/50"
        return "text-red-500 bg-red-100/5   0"
    }


    return (
        <div className="h-full overflow-y-auto rounded-lg shadow-sm ">
            <table className="w-full h-full border-collapse ">
                <thead className="bg-blue-600 sticky top-0  ">
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
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-6 text-center text-gray-500 bg"
                            >
                                <div className=" flex items-center justify-center h-full">
                                    <p className="bg-red-100/20 px-5 py-0.5 border border-red-600 rounded-sm  ">
                                        ไม่พบข้อมูล
                                    </p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((row, i) => (
                            <tr
                                key={i}
                                className={`text-black hover:bg-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-blue-50"
                                    }`}
                            >
                                {columns.map(col => {
                                    const key = String(col.key)
                                    const value = row[col.key]

                                    return (
                                        <td key={key} className="px-4 py-1.5 w-10 text-t">
                                            {key === "qrContent" ? (
                                                <button
                                                    className="px-2 py-1 text-sm text-white bg-blue-500 rounded-sm hover:bg-blue-600"
                                                    onClick={() => openTextModal("QR Content", value)}
                                                >
                                                    เปิดอ่าน
                                                </button>
                                            ) : key === "respMsg" ? (
                                                <p className={`${getRespMsgClass(value)} font-medium border-0.5 border px-2  rounded-sm w-max `}>
                                                    {String(value ?? "_")}
                                                </p>
                                            ) : (
                                                String(value ?? "")
                                            )}
                                        </td>
                                    )
                                })}

                            </tr>
                        ))
                    )}
                </tbody>

            </table>
        </div >
    )
}
