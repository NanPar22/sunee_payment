"use client"

import { useState } from "react"
import clsx from "clsx"

export default function Search() {
    const [value, setValue] = useState("")

    return (
        <div className="flex gap-0.5 rounded-sm border border-blue-600  w-full h-6 max-w-screen p-0.5 ">
            <input
                placeholder="ค้นหา"
                type="search"
                name=""
                id=""
                className={clsx(
                    "w-full placeholder:text-blue-300/60 text-blue-300/60 text-sm",
                    "focus:outline-none focus:ring-0",
                    "[&::-webkit-search-cancel-button]:appearance-none"
                )}
            />
            <button
                type="button"
                className="flex items-center justify-center w-5 rounded-xs hover:bg-blue-300/60  hover:text-white  text-blue-600 ">
                <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </button>
        </div>
    )
} 
