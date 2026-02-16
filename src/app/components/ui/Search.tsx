"use client"

import { useState } from "react"
import clsx from "clsx"

type SearchProps = {
  onSearch?: (value: string) => void
}

export default function Search({ onSearch }: SearchProps) {
  const [value, setValue] = useState("")

  return (
    <div className="flex gap-0.5 rounded-sm border border-blue-500 w-full h-6 p-0.5 ">
      <input
        placeholder="ค้นหา"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={clsx(
          "w-full placeholder:text-blue-300/60 text-blue-500 text-sm",
          "focus:outline-none focus:ring-0 ",
          "[&::-webkit-search-cancel-button]:appearance-none"
        )}
      />

      <button
        type="button"
        onClick={() => onSearch?.(value)}
        className="flex items-center justify-center w-5 rounded-xs hover:bg-blue-300/60 hover:text-white text-blue-500"
      >
        <i className="fa-solid fa-magnifying-glass text-xs"></i>
      </button>
    </div>
  )
}
