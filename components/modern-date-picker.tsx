"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ModernDatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
  label?: string
}

export function ModernDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  label,
}: ModernDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(value ? new Date(value) : new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    onChange(date.toISOString().split("T")[0])
    setOpen(false)
  }

  const handleClear = () => {
    setSelectedDate(undefined)
    onChange("")
    setOpen(false)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-12 justify-start text-left font-normal bg-gray-900/50 border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-600/50 rounded-xl transition-all duration-300",
              !selectedDate && "text-gray-500",
              className,
            )}
          >
            <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0 bg-gray-900/95 border-gray-700/50 shadow-2xl backdrop-blur-xl rounded-2xl"
          align="start"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth("prev")}
                className="h-10 w-10 text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 rounded-xl"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-yellow-400">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth("next")}
                className="h-10 w-10 text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 rounded-xl"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="h-10 flex items-center justify-center text-sm font-medium text-gray-400 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <div key={index} className="h-12 flex items-center justify-center">
                  {date ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateSelect(date)}
                      className={cn(
                        "h-12 w-12 p-0 font-semibold text-base rounded-xl transition-all duration-200 hover:bg-gray-700/50 hover:text-yellow-400",
                        isToday(date) && "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                        isSelected(date) && "bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black shadow-lg",
                        !isSelected(date) && !isToday(date) && "text-gray-300",
                      )}
                    >
                      {date.getDate()}
                    </Button>
                  ) : (
                    <div className="h-12 w-12" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  setCurrentMonth(today)
                  handleDateSelect(today)
                }}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl"
              >
                Today
              </Button>

              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
