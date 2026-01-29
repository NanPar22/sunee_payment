'use client'

import { useDateRange } from "@/hooks/useDateRange"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"


export default function DateRangePicker() {
  const {
    startDate,
    endDate,
    setStart,
    setEnd,
    clear,
    isComplete,
  } = useDateRange()

  return (
    <div className="w-full h-6 flex items-center gap-4">
      <label className="text-sm font-semibold font-main text-blue-900">
        ช่วงวันที่
      </label>

      {/* Start Date */}
      <div className="relative h-6 px-0.5 flex justify-center items-center border border-blue-600 font-semibold text-blue-600 rounded-sm ">
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
          isClearable={false}
          shouldCloseOnSelect={false}
          className="w-50 h-6 text-center placeholder:text-center flex items-center justify-center rounded-sm p-2 focus:outline-none focus:ring-0"
        />
        {/* Action */}
          {/* {isComplete && (
            <div className="flex justify-center items-center ">
              <button
                type="button"
                onClick={clear}
                className="text-xs text-red-500 self-end bg-red-200 h-4 p-1 border text-center rounded-sm flex items-center justify-center"
              >
                X
              </button>
            </div>
          )} */}
      </div>
    </div>
  )
}
