// hooks/useTable.ts
import { useEffect, useMemo, useState } from "react"

export type Column<T> = {
  key: keyof T
  label: string
  sortable?: boolean
}

export function useTable<T>(
  data: T[],
  columns: Column<T>[],
  initialPageSize: number = 5
) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1
      if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortOrder])

  // pagination
  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / pageSize)
  )

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, page, pageSize])

  const onSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  useEffect(() => {
    setPage(1)
  }, [data, pageSize])

  return {
    columns,
    data: paginatedData,
    page,
    pageSize,        // ✅ เพิ่ม
    totalPages,
    setPage,
    setPageSize,     // ✅ เพิ่ม
    onSort,
    sortKey,
    sortOrder,
  }
}
