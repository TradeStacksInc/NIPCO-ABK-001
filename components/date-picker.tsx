"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Select date", className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      onChange(selectedDate.toISOString().split("T")[0])
    } else {
      onChange("")
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-gray-400 hover:text-yellow-400 hover:bg-gray-900 transition-all duration-200",
            value && "text-yellow-400",
            className,
          )}
        >
          <CalendarIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700 shadow-2xl" align="end" side="bottom">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="bg-gray-900 text-white"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center text-yellow-400 font-bold text-lg",
            caption_label: "text-lg font-bold text-yellow-400",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-8 w-8 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-yellow-400 border border-gray-600 rounded-lg transition-all duration-200",
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-gray-400 rounded-md w-12 font-bold text-sm uppercase tracking-wider",
            row: "flex w-full mt-2",
            cell: cn(
              "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gray-800 [&:has([aria-selected].day-outside)]:bg-gray-800/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
              "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
            ),
            day: cn(
              "h-12 w-12 p-0 font-bold text-lg aria-selected:opacity-100 hover:bg-gray-700 hover:text-yellow-400 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-600",
              "text-gray-300",
            ),
            day_range_end: "day-range-end",
            day_selected: cn(
              "bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black focus:bg-yellow-400 focus:text-black border-yellow-400 shadow-lg shadow-yellow-400/20",
            ),
            day_today: "bg-gray-800 text-yellow-400 border-yellow-400/50 font-bold",
            day_outside:
              "text-gray-600 opacity-50 aria-selected:bg-gray-800/50 aria-selected:text-gray-600 aria-selected:opacity-30",
            day_disabled: "text-gray-600 opacity-30",
            day_range_middle: "aria-selected:bg-gray-800 aria-selected:text-gray-300",
            day_hidden: "invisible",
          }}
        />
        {value && (
          <div className="p-3 border-t border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSelect(undefined)}
              className="w-full text-gray-400 hover:text-red-400 hover:bg-gray-800"
            >
              Clear Date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
