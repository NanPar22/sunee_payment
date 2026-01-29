import { useState } from "react"

// components/Pagination.tsx
type PaginationProps = {
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
}

export function Pagination({
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange
}: PaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    const sizes = [10, 15, 20, 50, 100]
    const [open, setOpen] = useState(false)

    return (
        <div className="flex items-center justify-between gap-2 shadow-sm rounded-sm text-black p-2 w-full  ">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">แสดง</span>
                <div className="relative w-15">
                    {/* ตัวที่มองเห็นแทน select */}
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className="w-full border px-2 py-1 rounded-sm text-left bg-white flex items-center justify-center focus:outline-none focus:ring-0"
                    >
                        {pageSize}
                        <i
                            className={`fa-solid transition-transform duration-200
                            ${open ? "fa-caret-down" : "fa-caret-right"}
                            `}
                        />
                    </button>
                    {/* dropdown option */}
                    {open && (
                        <ul className="absolute left-0 bottom-0  mb-9 w-full flex flex-col gap-px justify-center items-center p-px bg-white border rounded-sm  z-20">
                            {sizes.map(size => (
                                <li
                                    key={size}
                                    onClick={() => {
                                        onPageSizeChange?.(size)
                                        setOpen(false)
                                    }}
                                    className={`px-2 py-1 cursor-pointer w-full text-center hover:bg-blue-500 hover:text-white rounded-xs
                          ${size === pageSize ? "bg-blue-100" : ""}
                          `}
                                >
                                    {size}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <span className="text-sm text-gray-600">รายการ</span>
            </div>
            <div className="flex gap-2">
                {/* Prev */}
                <button
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Prev
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                    {pages.map(p => (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`px-3 py-1 border rounded
              ${p === page ? "bg-blue-600 text-white" : "hover:bg-gray-100"}
            `}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {/* Next */}
                <button
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    )
}
