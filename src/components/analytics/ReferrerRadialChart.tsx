"use client";

import * as React from "react";
import { Share2 } from "lucide-react";
import { LabelList, RadialBar, RadialBarChart } from "recharts";

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

interface ReferrerRadialChartProps {
  data: Array<{ name: string; count: number }>;
  title?: string;
  maxItems?: number;
}

// Helper to format referrer names
const formatReferrerName = (referrer: string): string => {
  if (referrer.startsWith("utm_source:")) {
    return referrer.replace("utm_source:", "");
  }
  if (referrer.startsWith("ref:")) {
    return referrer.replace("ref:", "");
  }
  if (referrer.startsWith("internal:")) {
    const path = referrer.replace("internal:", "");
    return path.length > 20 ? "Internal" : path;
  }
  if (referrer === "direct") {
    return "Direct";
  }
  try {
    const url = new URL(referrer);
    return url.hostname.replace("www.", "");
  } catch {
    return referrer.length > 15 ? referrer.substring(0, 15) + "..." : referrer;
  }
};

export function ReferrerRadialChart({
  data,
  title = "Traffic Sources",
  maxItems = 5,
}: ReferrerRadialChartProps) {
  const sortedData = React.useMemo(() => {
    return [...data]
      .sort((a, b) => b.count - a.count)
      .slice(0, maxItems);
  }, [data, maxItems]);

  const chartData = React.useMemo(() => {
    return sortedData.map((item, index) => ({
      referrer: formatReferrerName(item.name),
      visitors: item.count,
      fill: `var(--color-referrer-${index + 1})`,
    }));
  }, [sortedData]);

  const chartConfig: ChartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      visitors: {
        label: "Views",
      },
    };

    chartData.forEach((item, index) => {
      config[`referrer-${index + 1}`] = {
        label: item.referrer,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });

    return config;
  }, [chartData]);

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, [chartData]);

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
            No referrer data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#3498DB]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#3498DB]/10 to-[#2C3E50]/10">
            <Share2 className="h-5 w-5 text-[#3498DB]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl text-[#2C3E50] dark:text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-0.5">
              Top {chartData.length} sources • {totalVisitors} total views
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 sm:pb-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px] sm:max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={100}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="referrer" />}
            />
            <RadialBar dataKey="visitors" background>
              <LabelList
                position="insideStart"
                dataKey="referrer"
                className="fill-white dark:fill-[#2C3E50] capitalize mix-blend-difference text-[9px] sm:text-[11px] font-medium"
                fontSize={9}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
