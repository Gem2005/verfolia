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

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Pick a date",
  error = false,
  className,
  disabled = false,
}) => {
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
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3",
            !isValidDate && "text-muted-foreground",
            error && "border-red-500 focus-visible:border-red-500",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {isValidDate ? format(selectedDate, "PPP") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={isValidDate ? selectedDate : undefined}
          onSelect={handleSelect}
          captionLayout="dropdown-months"
          fromYear={1950}
          toYear={new Date().getFullYear() + 10}
          defaultMonth={isValidDate ? selectedDate : undefined}
        />
      </PopoverContent>
    </Popover>
  );
};

DatePicker.displayName = "DatePicker";

// MonthPicker for month-only selection (used in resume dates)
interface MonthPickerProps {
  value?: string; // Format: "YYYY-MM" or "January 2025" or empty
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
  value,
  onChange,
  placeholder,
  error = false,
  className,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);

  // Convert various date formats to Date object
  const selectedDate = React.useMemo(() => {
    if (!value || value.trim() === '') return undefined;
    
    // Handle YYYY-MM format
    if (/^\d{4}-\d{2}$/.test(value)) {
      const [year, month] = value.split('-').map(Number);
      if (!year || !month || month < 1 || month > 12) return undefined;
      return new Date(year, month - 1, 1);
    }
    
    // Handle "January 2025" or "Jan 2025" format
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    const shortMonths = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];
    
    const parts = value.trim().toLowerCase().split(/\s+/);
    if (parts.length === 2) {
      const monthStr = parts[0];
      const year = parseInt(parts[1], 10);
      
      let monthIndex = months.indexOf(monthStr);
      if (monthIndex === -1) {
        monthIndex = shortMonths.indexOf(monthStr);
      }
      
      if (monthIndex !== -1 && !isNaN(year)) {
        return new Date(year, monthIndex, 1);
      }
    }
    
    return undefined;
  }, [value]);

  // Check if the date is valid
  const isValidDate = selectedDate && !isNaN(selectedDate.getTime());

  const handleSelect = (date: Date | undefined) => {
    if (date && onChange) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      onChange(`${year}-${month}`);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3",
            !isValidDate && "text-muted-foreground",
            error && "border-red-500 focus-visible:border-red-500",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {isValidDate
              ? selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
              : (placeholder || 'Select month')}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={isValidDate ? selectedDate : undefined}
          onSelect={handleSelect}
          captionLayout="dropdown-months"
          fromYear={1950}
          toYear={new Date().getFullYear() + 10}
          defaultMonth={isValidDate ? selectedDate : undefined}
        />
      </PopoverContent>
    </Popover>
  );
};

MonthPicker.displayName = "MonthPicker";
