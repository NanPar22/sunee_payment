"use client"

import { useMemo, useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

type DateRangePickerProps = {
  onChange?: (from?: string, to?: string) => void
}

export default function DateRangePicker({ onChange }: DateRangePickerProps) {
  // 👉 default range (คำนวณครั้งเดียว)
  const defaultRange = useMemo(() => {
    const start = new Date()
    const end = new Date()
    end.setDate(start.getDate() + 1)
    return { start, end }
  }, [])

  const [startDate, setStartDate] = useState<Date | null>(defaultRange.start)
  const [endDate, setEndDate] = useState<Date | null>(defaultRange.end)

  const emitChange = (start: Date | null, end: Date | null) => {
    const from = start ? start.toISOString().slice(0, 10) : undefined
    const to = end ? end.toISOString().slice(0, 10) : undefined
    onChange?.(from, to)
  }

  const setStart = (date: Date | null) => {
    setStartDate(date)
    if (date && endDate && endDate < date) {
      setEndDate(null)
      emitChange(date, null)
    } else {
      emitChange(date, endDate)
    }
  }

  const setEnd = (date: Date | null) => {
    setEndDate(date)
    emitChange(startDate, date)
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
            setStart(start)
            setEnd(end)
          }}
          placeholderText="เลือกช่วงวันที่"
          dateFormat="dd/MM/yyyy"
          monthsShown={2}
          shouldCloseOnSelect={false}
          className="h-6 text-center rounded-sm p-2 focus:outline-none"
        />
      </div>
    </div>
  )
}
