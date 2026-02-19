"use client"

import { useState, useRef, useEffect } from "react"

type Option = {
    label: string
    value: number
}

type DropdownInputProps = {
    options: Option[]                // ✅ ต้องเป็น array
    value?: number                   // ✅ เก็บ id
    placeholder?: string
    onChange?: (value: number) => void  // ✅ ส่งกลับ id
    className?: string
}

export default function Dropdown_Input({
    options,
    value,
    placeholder = "Select option",
    onChange,
    className = "",
}: DropdownInputProps) {

    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // หา label จาก value
    const selectedLabel =
        options.find((opt) => opt.value === value)?.label

    return (
        <div className={`relative w-full ${className}`} ref={ref}>

            {/* Input */}
            <div
                onClick={() => setOpen(!open)}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white cursor-pointer flex justify-between items-center hover:border-blue-400 transition"
            >
                <span className="text-gray-700">
                    {selectedLabel || placeholder}
                </span>
                <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
                    ▼
                </span>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-0.5 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onChange?.(option.value)   // ✅ ส่ง id กลับ
                                setOpen(false)
                            }}
                            className={`px-3 py-2 cursor-pointer text-gray-600 hover:bg-blue-500 hover:text-white transition ${option.value === value ? "bg-blue-100" : ""
                                }`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
