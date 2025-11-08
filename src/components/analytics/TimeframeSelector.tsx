import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock } from "lucide-react";
import { TIMEFRAME_OPTIONS } from "@/lib/analytics/constants";
import type { TimeframeOption } from "@/types/analytics";

interface TimeframeSelectorProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
  compact?: boolean;
}

export function TimeframeSelector({
  selectedTimeframe,
  onTimeframeChange,
  compact = false,
}: TimeframeSelectorProps) {
  const getTimeframeIcon = (value: string) => {
    if (value === "24h") return <Clock className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const getTimeframeDescription = (value: string) => {
    const option = TIMEFRAME_OPTIONS.find((opt) => opt.value === value);
    return option?.label || value;
  };

  if (compact) {
    return (
      <Tabs
        value={selectedTimeframe}
        onValueChange={(value) => onTimeframeChange(value as TimeframeOption)}
        className="w-auto"
      >
        <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-[#3498DB]/20 shadow-md h-auto grid grid-cols-4 gap-0.5 p-0.5 rounded-lg">
          {TIMEFRAME_OPTIONS.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="text-xs px-2 sm:px-3 py-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2C3E50] data-[state=active]:to-[#3498DB] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 font-medium rounded-md"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#2C3E50] to-[#3498DB] shadow-lg shadow-[#3498DB]/30 flex-shrink-0">
          {React.cloneElement(getTimeframeIcon(selectedTimeframe), { className: "h-4 w-4 sm:h-5 sm:w-5 text-white" })}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-[#2C3E50] dark:text-white">Time Period</h3>
          <p className="text-xs sm:text-sm text-[#34495E] dark:text-gray-400 truncate">
            Viewing data for {getTimeframeDescription(selectedTimeframe).toLowerCase()}
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs
        value={selectedTimeframe}
        onValueChange={(value) => onTimeframeChange(value as TimeframeOption)}
        className="w-full"
      >
        <TabsList className="bg-white dark:bg-gray-900 border-2 border-[#3498DB]/20 shadow-md w-full h-auto grid grid-cols-2 sm:grid-cols-4 gap-1 p-1">
          {TIMEFRAME_OPTIONS.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="text-xs sm:text-sm px-2 py-2 sm:py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2C3E50] data-[state=active]:to-[#3498DB] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#3498DB]/30 transition-all duration-300 font-medium whitespace-nowrap"
            >
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
