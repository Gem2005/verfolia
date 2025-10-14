import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { TIMEFRAME_OPTIONS } from "@/lib/analytics/constants";
import type { TimeframeOption } from "@/types/analytics";

interface TimeframeSelectorProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
}

export function TimeframeSelector({
  selectedTimeframe,
  onTimeframeChange,
}: TimeframeSelectorProps) {
  const getTimeframeIcon = (value: string) => {
    if (value === "24h") return <Clock className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const getTimeframeDescription = (value: string) => {
    const option = TIMEFRAME_OPTIONS.find((opt) => opt.value === value);
    return option?.label || value;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {getTimeframeIcon(selectedTimeframe)}
            <div>
              <h3 className="text-sm font-medium">Time Period</h3>
              <p className="text-xs text-muted-foreground">
                {getTimeframeDescription(selectedTimeframe)}
              </p>
            </div>
          </div>

          <Tabs
            value={selectedTimeframe}
            onValueChange={(value) => onTimeframeChange(value as TimeframeOption)}
            className="w-auto"
          >
            <TabsList>
              {TIMEFRAME_OPTIONS.map((option) => (
                <TabsTrigger
                  key={option.value}
                  value={option.value}
                  className="min-w-[60px]"
                >
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
