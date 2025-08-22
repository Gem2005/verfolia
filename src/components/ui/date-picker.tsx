"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "Pick a date",
      error = false,
      className,
      disabled = false,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    // Convert string value to Date object
    const selectedDate = value ? new Date(value) : undefined;

    // Check if the date is valid
    const isValidDate = selectedDate && !isNaN(selectedDate.getTime());

    const handleSelect = (date: Date | undefined) => {
      if (date && onChange) {
        // Format date as YYYY-MM-DD for consistency with form data
        const formattedDate = format(date, "yyyy-MM-dd");
        onChange(formattedDate);
      }
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-11",
              !isValidDate && "text-muted-foreground",
              error && "border-red-500",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isValidDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={isValidDate ? selectedDate : undefined}
            onSelect={handleSelect}
            autoFocus
            captionLayout="dropdown"
            startMonth={new Date(1950, 0)}
            endMonth={new Date(new Date().getFullYear() + 10, 11)}
          />
        </PopoverContent>
      </Popover>
    );
  }
);

DatePicker.displayName = "DatePicker";
