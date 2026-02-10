"use client"

import { useState } from "react"

type DropdownProps<T extends string | number> = {
    value: T
    options: T[]
    onChange?: (value: T) => void
    className?: string
}

export default function Dropdown<T extends string | number>({
    value,
    options,
    onChange,
    className = "",
}: DropdownProps<T>) {
    const [open, setOpen] = useState(false)

    return (
        <div className={`relative h-6 text-sm ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full h-full border border-blue-600 text-blue-600 px-2 rounded-sm  flex items-center justify-center gap-1"
            > 
                {value}
                <i
                    className={`fa-solid transition-transform duration-200
                        ${open ? "fa-caret-down" : "fa-caret-right"}`}
                />
            </button>

            {open && (
                <ul className="absolute left-0 mt-0.5 w-full p-0.5 bg-white border rounded-sm z-20 flex flex-col gap-0.5">
                    {options.map(option => (
                        <li
                            key={option}
                            onClick={() => {
                                onChange?.(option)
                                setOpen(false)
                            }}
                            className={`px-2 py-0.5  cursor-pointer text-blue-600 text-center rounded-sm
                            hover:bg-blue-500 hover:text-white
                            ${option === value ? "bg-blue-100" : ""}`}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
