"use client"

import { useEffect, useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

type DateRangePickerProps = {
  from?: string
  to?: string
  onChange?: (from?: string, to?: string) => void
}

/** แปลง YYYY-MM-DD → Date แบบ local (ไม่ UTC) */
const parseLocalDate = (value?: string): Date | null => {
  if (!value) return null
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** แปลง Date → YYYY-MM-DD แบบ local */
const formatLocalDate = (date: Date | null): string | undefined => {
  if (!date) return undefined
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function DateRangePicker({
  from,
  to,
  onChange,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  // ✅ sync ค่า จากหน้าที่เรียก (แบบ local time)
  useEffect(() => {
    setStartDate(parseLocalDate(from))
    setEndDate(parseLocalDate(to))
  }, [from, to])

  const emitChange = (start: Date | null, end: Date | null) => {
    onChange?.(formatLocalDate(start), formatLocalDate(end))
  }

  return (
    <div className="w-full h-6 flex items-center gap-4">
      <label className="text-sm font-semibold text-blue-900">
        ช่วงวันที่
      </label>

      <div className="relative h-6 px-0.5 flex items-center border border-blue-600 text-blue-600 rounded-sm">
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(dates) => {
            const [start, end] = dates as [Date | null, Date | null]
            setStartDate(start)
            setEndDate(end)
            emitChange(start, end)
          }}
          placeholderText="เลือกช่วงวันที่"
          dateFormat="dd/MM/yyyy"
          monthsShown={2}
          shouldCloseOnSelect={false}
          className="h-6 text-center rounded-sm p-2 focus:outline-none "
        />
      </div>
    </div>
  )
}
