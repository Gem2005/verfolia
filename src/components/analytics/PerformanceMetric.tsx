import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PerformanceMetricProps {
  label: string;
  value: number;
  change?: number;
  format?: "number" | "percentage" | "duration";
  showTrend?: boolean;
}

export function PerformanceMetric({
  label,
  value,
  change,
  format = "number",
  showTrend = true,
}: PerformanceMetricProps) {
  const formatValue = (val: number): string => {
    switch (format) {
      case "percentage":
        return `${val.toFixed(1)}%`;
      case "duration":
        if (val < 60) return `${Math.round(val)}s`;
        const minutes = Math.floor(val / 60);
        const seconds = Math.round(val % 60);
        return `${minutes}m ${seconds}s`;
      case "number":
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (!change || change === 0) return Minus;
    return change > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (!change || change === 0) return "text-muted-foreground";
    return change > 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  };

  const TrendIcon = getTrendIcon();

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">{formatValue(value)}</p>
      </div>

      {showTrend && change !== undefined && (
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          <TrendIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            {Math.abs(change).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
