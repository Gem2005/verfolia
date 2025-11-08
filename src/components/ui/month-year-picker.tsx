"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface MonthYearPickerProps {
  value?: string; // Format: "YYYY-MM" or "January 2025" or empty
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
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
    const monthsLower = months.map(m => m.toLowerCase());
    const shortMonthsLower = months.map(m => m.slice(0, 3).toLowerCase());
    
    const parts = value.trim().toLowerCase().split(/\s+/);
    if (parts.length === 2) {
      const monthStr = parts[0];
      const year = parseInt(parts[1], 10);
      
      let monthIndex = monthsLower.indexOf(monthStr);
      if (monthIndex === -1) {
        monthIndex = shortMonthsLower.indexOf(monthStr);
      }
      
      if (monthIndex !== -1 && !isNaN(year)) {
        return new Date(year, monthIndex, 1);
      }
    }
    
    return undefined;
  }, [value]);

  const isValidDate = selectedDate && !isNaN(selectedDate.getTime());
  
  const [displayYear, setDisplayYear] = React.useState(
    isValidDate ? selectedDate.getFullYear() : new Date().getFullYear()
  );

  const handleMonthSelect = (monthIndex: number) => {
    if (onChange) {
      const year = displayYear;
      const month = String(monthIndex + 1).padStart(2, '0');
      onChange(`${year}-${month}`);
    }
    setOpen(false);
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    setDisplayYear(prev => direction === 'prev' ? prev - 1 : prev + 1);
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
        <div 
          className="p-4 bg-background/95 border-0 rounded-lg shadow-lg w-[280px]"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Year selector */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleYearChange('prev')}
              className="h-8 w-8 hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="font-semibold text-sm">
              {displayYear}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleYearChange('next')}
              className="h-8 w-8 hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => {
              const isSelected = isValidDate && 
                selectedDate.getMonth() === index && 
                selectedDate.getFullYear() === displayYear;
              
              return (
                <Button
                  key={month}
                  variant="ghost"
                  onClick={() => handleMonthSelect(index)}
                  className={cn(
                    "h-9 text-xs font-medium hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  {month.slice(0, 3)}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

MonthYearPicker.displayName = "MonthYearPicker";
