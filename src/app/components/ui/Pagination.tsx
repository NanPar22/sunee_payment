import { useState } from "react"

// =====================
// types
// =====================
type PageItem = number | "..."

type PaginationProps = {
    page: number
    pageSize: number
    totalPages: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
}

// =====================
// helper
// =====================
export function getPaginationPages(
    page: number,
    totalPages: number
): PageItem[] {
    if (totalPages <= 0) return []

    if (totalPages === 1) return [1]

    if (totalPages === 2) return [1, 2]

    const pages: PageItem[] = []
    const window = 1 // แสดงรอบ page ข้างละ 1

    // ---------- หน้าแรก ----------
    pages.push(1)

    // ---------- ซ้ายของ window ----------
    if (page - window > 2) {
        pages.push("...")
    }

    // ---------- กลาง (window รอบ page) ----------
    const start = Math.max(2, page - window)
    const end = Math.min(totalPages - 1, page + window)

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    // ---------- ขวาของ window ----------
    if (page + window < totalPages - 1) {
        pages.push("...")
    }

    // ---------- หน้าสุดท้าย ----------
    pages.push(totalPages)

    return pages
}

// =====================
// component
// =====================
export function Pagination({
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange
}: PaginationProps) {
    const pages = getPaginationPages(page, totalPages)

    const sizes = [10, 15, 20, 50, 100]
    const [open, setOpen] = useState(false)

    return (
        <div className="flex items-center justify-between gap-2 shadow-sm rounded-sm text-black p-2 w-full">
            {/* page size */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">แสดง</span>

                <div className="relative w-15">
                    <button
                        type="button"
                        onClick={() => setOpen(o => !o)}
                        className="w-full border px-2  rounded-sm bg-white flex items-center justify-center"
                    >
                        {pageSize}
                        <i
                            className={`fa-solid transition-transform duration-200
                            ${open ? "fa-caret-down" : "fa-caret-right"}`}
                        />
                    </button>

                    {open && (
                        <ul className="absolute left-0 bottom-0 mb-9 p-0.5 w-full bg-white border rounded-sm z-20 flex flex-col gap-0.5">
                            {sizes.map(size => (
                                <li
                                    key={size}
                                    onClick={() => {
                                        onPageSizeChange?.(size)
                                        setOpen(false)
                                    }}
                                    className={`px-2 py-0.5 cursor-pointer text-center hover:bg-blue-500 hover:text-white rounded-xs
                                    ${size === pageSize ? "bg-blue-100" : ""}`}
                                >
                                    {size}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <span className="text-sm text-gray-600">รายการ</span>
            </div>

            {/* pagination */}
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
                <div className="flex gap-0.5">
                    {pages.map((p, i) =>
                        p === "..." ? (
                            <span
                                key={`ellipsis-${i}`}
                                className="px-3 py-1 text-gray-400"
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={`page-${p}-${i}`}
                                onClick={() => onPageChange(p)}
                                className={`px-3 py-1  rounded
                                ${p === page
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-100"}`}
                            >
                                {p}
                            </button>
                        )
                    )}
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
