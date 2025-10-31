"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { TimeSeriesDataPoint } from "@/types/analytics";
import { TrendingUp } from "lucide-react";

interface CombinedTimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  title?: string;
  showLegend?: boolean;
}

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  interactions: {
    label: "Interactions",
    color: "hsl(var(--chart-2))",
  },
  returningViews: {
    label: "Returning Views",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function CombinedTimeSeriesChart({
  data,
  title = "Activity Trends",
}: CombinedTimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-2 border-[#3498DB]/10 shadow-lg">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalViews = data.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalInteractions = data.reduce((sum, item) => sum + (item.interactions || 0), 0);
  const totalReturningViews = data.reduce((sum, item) => sum + (item.returningViews || 0), 0);
  const returningPercentage = totalViews > 0 ? Math.round((totalReturningViews / totalViews) * 100) : 0;
  
  const chartData = data;

  return (
    <Card className="border-2 border-[#3498DB]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#3498DB]/10 to-[#2C3E50]/10">
              <TrendingUp className="h-5 w-5 text-[#3498DB]" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl text-[#2C3E50] dark:text-white">
                {title}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Track your resume engagement over time
              </CardDescription>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[var(--chart-1)]"></div>
            <span className="text-gray-600 dark:text-gray-400">{totalViews} total views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[var(--chart-2)]"></div>
            <span className="text-gray-600 dark:text-gray-400">{totalInteractions} interactions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[var(--chart-3)]"></div>
            <span className="text-gray-600 dark:text-gray-400">{totalReturningViews} returning ({returningPercentage}%)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-6 sm:pb-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] sm:h-[320px] w-full"
        >
          <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillInteractions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-interactions)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-interactions)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillReturningViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-returningViews)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-returningViews)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={32}
              className="text-xs fill-[#2C3E50] dark:fill-white"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={10} 
              className="text-xs fill-[#2C3E50] dark:fill-white"
              tick={{ fill: 'currentColor' }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area dataKey="views" type="monotone" fill="url(#fillViews)" stroke="var(--color-views)" strokeWidth={2.5} />
            <Area dataKey="interactions" type="monotone" fill="url(#fillInteractions)" stroke="var(--color-interactions)" strokeWidth={2} />
            <Area dataKey="returningViews" type="monotone" fill="url(#fillReturningViews)" stroke="var(--color-returningViews)" strokeWidth={2} />
            <ChartLegend content={<ChartLegendContent />} className="pt-4" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
