"use client"

import { useEffect, useRef, useState } from "react"

type DateRangePickerProps = {
  from?: string
  to?: string
  onChange?: (from?: string, to?: string) => void
}

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  dateString: string
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

const getCalendarDays = (
  year: number,
  month: number,
  mode: "start" | "end"
): CalendarDay[] => {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const prevMonthDays = getDaysInMonth(year, month - 1)

  const days: CalendarDay[] = []

  const today = new Date()

  // =========================
  // MONTH 1 (มีเดือนก่อน)
  // =========================
  if (mode === "start") {
    const prevYear = month === 0 ? year - 1 : year
    const prevMonth = month === 0 ? 11 : month - 1

    for (let i = firstDay - 1; i >= 0; i--) {
      const date = prevMonthDays - i
      const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`

      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        dateString,
      })
    }
  } else {
    // 👉 MONTH 2 → เติมช่องว่างแทน
    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: 0,
        isCurrentMonth: false,
        isToday: false,
        dateString: "",
      })
    }
  }

  // =========================
  // CURRENT MONTH
  // =========================
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === i

    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`

    days.push({
      date: i,
      isCurrentMonth: true,
      isToday,
      dateString,
    })
  }

  // =========================
  //  MONTH 2 → เติมเดือนถัดไป
  // =========================
  if (mode === "end") {
    const nextYear = month === 11 ? year + 1 : year
    const nextMonth = month === 11 ? 0 : month + 1

    let nextDate = 1
    while (days.length % 7 !== 0) {
      const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(nextDate).padStart(2, "0")}`

      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        dateString,
      })

      nextDate++
    }
  }

  return days
}


const isDateInRange = (
  dateStr: string,
  from: string | undefined,
  to: string | undefined
): boolean => {
  if (!from || !to) return false
  return dateStr >= from && dateStr <= to
}

const isDateRangeStart = (dateStr: string, from: string | undefined) => {
  return from === dateStr
}

const isDateRangeEnd = (dateStr: string, to: string | undefined) => {
  return to === dateStr
}

export default function DateRangePicker({
  from,
  to,
  onChange,
}: DateRangePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [startDate, setStartDate] = useState<string>(from || "")
  const [endDate, setEndDate] = useState<string>(to || "")
  const [tempStart, setTempStart] = useState<string>(from || "")
  const [tempEnd, setTempEnd] = useState<string>(to || "")

  const today = new Date()
  const [monthYear, setMonthYear] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  })

  useEffect(() => {
    setStartDate(from || "")
    setEndDate(to || "")
    setTempStart(from || "")
    setTempEnd(to || "")
  }, [from, to])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen])

  const handleDayClick = (dateString: string) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateString)
      setTempEnd("")
    } else if (dateString < tempStart) {
      setTempStart(dateString)
      setTempEnd("")
    } else if (dateString === tempStart) {
      setTempStart("")
    } else {
      setTempEnd(dateString)
    }
  }

  const handleApply = () => {
    setStartDate(tempStart)
    setEndDate(tempEnd)
    onChange?.(tempStart || undefined, tempEnd || undefined)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempStart(startDate)
    setTempEnd(endDate)
    setIsOpen(false)
  }

  const handleClear = () => {
    setStartDate("")
    setEndDate("")
    setTempStart("")
    setTempEnd("")
    onChange?.(undefined, undefined)
    setIsOpen(false)
  }

  const month1Days = getCalendarDays(
    monthYear.year,
    monthYear.month,
    "start"
  )

  const nextMonth = monthYear.month === 11 ? 0 : monthYear.month + 1
  const nextYear = monthYear.month === 11 ? monthYear.year + 1 : monthYear.year

  const month2Days = getCalendarDays(
    nextYear,
    nextMonth,
    "end"
  )

  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม"
  ]

  const displayText =
    startDate && endDate
      ? `${startDate} — ${endDate}`
      : startDate
        ? `${startDate} —`
        : "กรุณาเลือกวันที่"

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-0.5 h-6 border border-blue-300 rounded-sm bg-white text-left text-sm font-medium text-blue-500 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
      >
        {displayText}
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full lg:left-0 right-0 mt-1 max-lg:mt-0 bg-white border border-slate-300 rounded-sm shadow-xl z-50 p-2 w-max">
          {/* Two Month Calendar - lg and above */}
          <div className="hidden lg:grid grid-cols-2 gap-2">
            {/* Month 1 */}
            <div className="">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() =>
                    setMonthYear((prev) => ({
                      ...prev,
                      month: prev.month === 0 ? 11 : prev.month - 1,
                      year:
                        prev.month === 0 ? prev.year - 1 : prev.year,
                    }))
                  }
                  className="text-slate-500 hover:text-slate-700 font-bold text-lg"
                >
                  ‹
                </button>
                <h3 className="text-center font-bold text-slate-900 flex-1">
                  {monthNames[monthYear.month]} {monthYear.year}
                </h3>
                <div className="w-6" />
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-slate-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {month1Days.map((day, idx) => {
                  const inRange = isDateInRange(day.dateString, tempStart, tempEnd)
                  const isStart = isDateRangeStart(day.dateString, tempStart)
                  const isEnd = isDateRangeEnd(day.dateString, tempEnd)

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDayClick(day.dateString)}
                      className={`
                        w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all
                        ${!day.isCurrentMonth ? "text-slate-300" : ""}
                        ${day.isToday && day.isCurrentMonth ? "ring-2 ring-blue-400" : ""}
                        ${isStart || isEnd ? "bg-blue-500 text-white font-bold" : ""}
                        ${inRange && !isStart && !isEnd ? "bg-blue-100 text-slate-900" : ""}
                        ${day.isCurrentMonth && !inRange && !isStart && !isEnd
                          ? "hover:bg-slate-100 text-slate-900"
                          : ""
                        }
                      `}
                    >
                      {day.date}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Month 2 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-6" />
                <h3 className="text-center font-bold text-slate-900 flex-1">
                  {monthNames[nextMonth]}{" "}
                  {nextYear}
                </h3>
                <button
                  onClick={() =>
                    setMonthYear((prev) => ({
                      ...prev,
                      month: prev.month === 11 ? 0 : prev.month + 1,
                      year:
                        prev.month === 11 ? prev.year + 1 : prev.year,
                    }))
                  }
                  className="text-slate-500 hover:text-slate-700 font-bold text-lg"
                >
                  ›
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-slate-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {month2Days.map((day, idx) => {
                  const inRange = isDateInRange(day.dateString, tempStart, tempEnd)
                  const isStart = isDateRangeStart(day.dateString, tempStart)
                  const isEnd = isDateRangeEnd(day.dateString, tempEnd)

                  if (!day.date) {
                    return <div key={idx} className="w-8 h-8" />
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDayClick(day.dateString)}
                      className={`
                        w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all
                        ${!day.isCurrentMonth ? "text-slate-300" : ""}
                        ${day.isToday && day.isCurrentMonth ? "ring-2 ring-blue-400" : ""}
                        ${isStart || isEnd ? "bg-blue-500 text-white font-bold" : ""}
                        ${inRange && !isStart && !isEnd ? "bg-blue-100 text-slate-900" : ""}
                        ${day.isCurrentMonth && !inRange && !isStart && !isEnd
                          ? "hover:bg-slate-100 text-slate-900"
                          : ""
                        }
                      `}
                    >
                      {day.date}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Single Month Calendar - below lg */}
          <div className="lg:hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() =>
                    setMonthYear((prev) => ({
                      ...prev,
                      month: prev.month === 0 ? 11 : prev.month - 1,
                      year:
                        prev.month === 0 ? prev.year - 1 : prev.year,
                    }))
                  }
                  className="text-slate-500 hover:text-slate-700 font-bold text-lg"
                >
                  ‹
                </button>
                <h3 className="text-center font-bold text-slate-900 flex-1">
                  {monthNames[monthYear.month]} {monthYear.year}
                </h3>
                <button
                  onClick={() =>
                    setMonthYear((prev) => ({
                      ...prev,
                      month: prev.month === 11 ? 0 : prev.month + 1,
                      year:
                        prev.month === 11 ? prev.year + 1 : prev.year,
                    }))
                  }
                  className="text-slate-500 hover:text-slate-700 font-bold text-lg"
                >
                  ›
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-slate-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {month1Days.map((day, idx) => {
                  const inRange = isDateInRange(day.dateString, tempStart, tempEnd)
                  const isStart = isDateRangeStart(day.dateString, tempStart)
                  const isEnd = isDateRangeEnd(day.dateString, tempEnd)

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDayClick(day.dateString)}
                      className={`
                        w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all
                        ${!day.isCurrentMonth ? "text-slate-300" : ""}
                        ${day.isToday && day.isCurrentMonth ? "ring-2 ring-blue-400" : ""}
                        ${isStart || isEnd ? "bg-blue-500 text-white font-bold" : ""}
                        ${inRange && !isStart && !isEnd ? "bg-blue-100 text-slate-900" : ""}
                        ${day.isCurrentMonth && !inRange && !isStart && !isEnd
                          ? "hover:bg-slate-100 text-slate-900"
                          : ""
                        }
                      `}
                    >
                      {day.date}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2 pt-1 border-t border-slate-200">
            <button
              onClick={handleCancel}
              className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-all"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              disabled={!tempStart}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-slate-300 transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}