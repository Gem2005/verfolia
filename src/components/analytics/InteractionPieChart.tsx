"use client";

import * as React from "react";
import { Activity } from "lucide-react";
import { Label, Pie, PieChart, Sector, Cell } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

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
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface InteractionPieChartProps {
  data: Array<{ name: string; count: number }>;
  title?: string;
}

export function InteractionPieChart({
  data,
  title = "Interactions by Type",
}: InteractionPieChartProps) {
  const id = "interaction-pie-interactive";
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Transform data
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((item) => {
      const formattedName = item.name
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

      return {
        type: item.name.toLowerCase().replace(/\s+/g, "_"),
        label: formattedName,
        interactions: item.count,
        fill: `var(--color-${item.name.toLowerCase().replace(/\s+/g, "_")})`,
      };
    });
  }, [data]);

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  // Build chart config dynamically
  const chartConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      interactions: {
        label: "Interactions",
      },
    };

    chartData.forEach((item, index) => {
      config[item.type] = {
        label: item.label,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });

    return config;
  }, [chartData]);

  const totalInteractions = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.interactions, 0);
  }, [chartData]);

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
            No interactions recorded
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={cardRef} data-chart={id} className="border-2 border-[#3498DB]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="space-y-1 pb-3 sm:pb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-[#3498DB]/10 to-[#2C3E50]/10">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-[#3498DB]" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg md:text-xl text-[#2C3E50] dark:text-white truncate">
              {title}
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs md:text-sm mt-0.5 truncate">
              Total: {totalInteractions} interactions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 sm:pb-6">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-h-[220px] sm:max-h-[280px] md:max-h-[300px] [&_.recharts-surface]:outline-none [&_.recharts-sector]:outline-none [&_*:focus]:outline-none"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="interactions"
              nameKey="type"
              innerRadius="40%"
              outerRadius="80%"
              strokeWidth={5}
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
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
                          className="fill-[#2C3E50] dark:fill-white text-xl sm:text-2xl md:text-3xl font-bold"
                        >
                          {activeIndex !== null 
                            ? chartData[activeIndex]?.interactions.toLocaleString()
                            : totalInteractions.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className="fill-[#2C3E50]/70 dark:fill-white/70 text-[10px] sm:text-xs md:text-sm"
                        >
                          {activeIndex !== null 
                            ? chartData[activeIndex]?.label
                            : "Total"}
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
