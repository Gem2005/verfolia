"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { Label, Pie, PieChart, Cell } from "recharts";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { CountryView } from "@/types/analytics";

interface CountryPieChartProps {
  data: CountryView[];
  title?: string;
}

export function CountryPieChart({
  data,
  title = "Views by Country",
}: CountryPieChartProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  const totalVisitors = React.useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data]);

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  // Reset active index when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActiveIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <Card className="border-2 border-[#3498DB]/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-[#2C3E50] dark:text-white">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground">
            No country data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Take top 5 countries and group rest as "Other"
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const top5 = sortedData.slice(0, 5);
  const others = sortedData.slice(5);
  const othersCount = others.reduce((sum, item) => sum + item.count, 0);

  const chartData = top5.map((item, index) => ({
    country: item.name,
    visitors: item.count,
    fill: `var(--color-country-${index + 1})`,
  }));

  if (othersCount > 0) {
    chartData.push({
      country: "Other",
      visitors: othersCount,
      fill: "var(--color-country-other)",
    });
  }

  const chartConfig: ChartConfig = {
    visitors: {
      label: "Views",
    },
    "country-1": {
      label: chartData[0]?.country || "Country 1",
      color: "hsl(var(--chart-1))",
    },
    "country-2": {
      label: chartData[1]?.country || "Country 2",
      color: "hsl(var(--chart-2))",
    },
    "country-3": {
      label: chartData[2]?.country || "Country 3",
      color: "hsl(var(--chart-3))",
    },
    "country-4": {
      label: chartData[3]?.country || "Country 4",
      color: "hsl(var(--chart-4))",
    },
    "country-5": {
      label: chartData[4]?.country || "Country 5",
      color: "hsl(var(--chart-5))",
    },
    "country-other": {
      label: "Other",
      color: "hsl(var(--muted))",
    },
  };

  return (
    <Card ref={cardRef} className="border-2 border-[#3498DB]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
              Distribution across {data.length} {data.length === 1 ? 'country' : 'countries'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 sm:pb-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px] sm:max-h-[250px] [&_.recharts-surface]:outline-none [&_.recharts-sector]:outline-none [&_*:focus]:outline-none"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="country"
              innerRadius={50}
              strokeWidth={5}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                  style={{
                    transition: 'fill-opacity 0.3s ease',
                    outline: 'none',
                  }}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-[#2C3E50] dark:fill-white text-2xl sm:text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-[#2C3E50]/70 dark:fill-white/70 text-xs sm:text-sm"
                        >
                          Views
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
