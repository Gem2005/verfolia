"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Globe } from "lucide-react";

interface CountryStackedChartProps {
  data: Array<Record<string, string | number>>;
  title?: string;
}

export function CountryStackedChart({
  data,
  title = "Geographic Distribution",
}: CountryStackedChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-2 border-[#3498DB]/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-[#2C3E50] dark:text-white">
            {title}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Views by country over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No geographic data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get all country keys (excluding 'date')
  const countryKeys = Object.keys(data[0] || {}).filter((key) => key !== "date");

  // Build chart config dynamically
  const chartConfig: ChartConfig = {};
  countryKeys.forEach((country, index) => {
    chartConfig[country] = {
      label: country,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
  });

  return (
    <Card className="border-2 border-[#3498DB]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#3498DB]/10 to-[#2C3E50]/10">
            <Globe className="h-5 w-5 text-[#3498DB]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl text-[#2C3E50] dark:text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-0.5">
              Views distribution across top countries
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-6 sm:pb-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] sm:h-[393px] w-full">
          <BarChart 
            accessibilityLayer 
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
          >
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={15}
              axisLine={false}
              className="text-[10px] sm:text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
              interval="preserveStartEnd"
              tickFormatter={(value) => {
                // Handle both ISO date strings and hour strings
                if (value.includes('T')) {
                  // For 24-hour format with ISO DateTime
                  const date = new Date(value + ':00:00Z');
                  if (!isNaN(date.getTime())) {
                    return date.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      hour12: true,
                    });
                  }
                } else if (value.includes(',') || value.includes(' ')) {
                  // Already formatted string from timeUtils
                  return value;
                }
                // Regular date format (YYYY-MM-DD)
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }
                return value;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-xs"
              allowDecimals={false}
            />
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            {countryKeys.map((country, index) => (
              <Bar
                key={country}
                dataKey={country}
                stackId="a"
                fill={`var(--color-${country})`}
                radius={index === countryKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  formatter={(value, name, item, index) => {
                    // Hide entries with 0 views
                    if (!value || Number(value) === 0) {
                      return null;
                    }
                    
                    const payload = item.payload as Record<string, string | number>;
                    const total = countryKeys.reduce(
                      (sum, key) => sum + (Number(payload[key]) || 0),
                      0
                    );
                    
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{
                              backgroundColor: `var(--color-${name})`,
                            }}
                          />
                          <span className="flex-1">{name}</span>
                          <div className="ml-auto flex items-baseline gap-1 font-mono font-medium tabular-nums text-foreground">
                            {value}
                            <span className="font-normal text-muted-foreground">
                              views
                            </span>
                          </div>
                        </div>
                        {/* Add total after the last item */}
                        {index === countryKeys.length - 1 && (
                          <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                            <span>Total</span>
                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                              {total}
                              <span className="font-normal text-muted-foreground">
                                views
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  }}
                />
              }
              cursor={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
