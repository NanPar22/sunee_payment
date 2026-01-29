"use client";

import { useState } from "react";

export function useDateRange() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(tomorrow);

  const setStart = (date: Date | null) => {
    setStartDate(date);

    // ถ้า endDate น้อยกว่า start ใหม่ → reset end
    if (date && endDate && endDate < date) {
      setEndDate(null);
    }
  };

  const setEnd = (date: Date | null) => {
    setEndDate(date);
  };

  const clear = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const isComplete = !!startDate && !!endDate;

  return {
    startDate,
    endDate,
    setStart,
    setEnd,
    clear,
    isComplete,
  };
}
