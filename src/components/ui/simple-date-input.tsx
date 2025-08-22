"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SimpleDateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  disabled?: boolean;
}

export const SimpleDateInput: React.FC<SimpleDateInputProps> = ({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  error = false,
  className,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        type="date"
        value={value || ""}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-11 pl-10",
          error && "border-red-500"
        )}
      />
      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
};
