import { useEffect, useState } from "react";

export type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
};

type UseTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSort?: (key: keyof T, order: "asc" | "desc") => void;
};

export function useTable<T>({
  data,
  columns,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onSort,
}: UseTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: keyof T) => {
    let nextOrder: "asc" | "desc" = "asc";

    if (sortKey === key) {
      nextOrder = sortOrder === "asc" ? "desc" : "asc";
    }

    setSortKey(key);
    setSortOrder(nextOrder);
    onSort?.(key, nextOrder); // 🔥 ส่งไปให้ backend
  };

  useEffect(() => {
    onPageChange(1);
  }, [pageSize]);

  return {
    columns,
    data,
    page,
    pageSize,
    totalPages,
    setPage: onPageChange,
    setPageSize: onPageSizeChange,
    onSort: handleSort,
    sortKey,
    sortOrder,
  };
}
