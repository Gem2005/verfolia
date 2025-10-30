import React from "react";
import { PerformanceMetric } from "./PerformanceMetric";
import { Eye, MousePointerClick, Clock, UserCheck } from "lucide-react";
import type { AnalyticsCalculations } from "@/hooks/use-analytics-calculations";

interface OverviewMetricsSectionProps {
  calculations: AnalyticsCalculations;
  loading?: boolean;
}

export function OverviewMetricsSection({
  calculations,
  loading = false,
}: OverviewMetricsSectionProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-[#3498DB]/20 shadow-xl shadow-[#3498DB]/10 p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-[#3498DB]/20 rounded w-24" />
              <div className="h-8 bg-[#3498DB]/20 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Views",
      icon: Eye,
      value: calculations.totalViews,
      change: calculations.viewsGrowthRate,
      format: "number" as const,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Interactions",
      icon: MousePointerClick,
      value: calculations.totalInteractions,
      change: calculations.interactionsGrowthRate,
      format: "number" as const,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Avg Duration",
      icon: Clock,
      value: calculations.avgViewDuration,
      change: calculations.durationGrowthRate,
      format: "duration" as const,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Returning Views",
      icon: UserCheck,
      value: calculations.totalReturningViews,
      subtitle: `${calculations.returningViewsPercentage}% of total`,
      format: "number" as const,
      showTrend: false,
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.title}
          className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-[#3498DB]/20 shadow-xl shadow-[#3498DB]/10 hover:shadow-2xl hover:shadow-[#3498DB]/20 transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          {/* Gradient Background on Hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3498DB]/5 to-[#2C3E50]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Content */}
          <div className="relative p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#34495E] dark:text-gray-400 uppercase tracking-wide">
                {metric.title}
              </h3>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            
            {/* Metric */}
            <div>
              <PerformanceMetric
                label=""
                value={metric.value}
                change={metric.change}
                format={metric.format}
                showTrend={metric.showTrend}
              />
              {'subtitle' in metric && metric.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {metric.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
