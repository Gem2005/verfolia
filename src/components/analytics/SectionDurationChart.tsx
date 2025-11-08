"use client";

import { TrendingUp, Eye, MousePointerClick } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface SectionDurationData {
  section: string;
  avgDuration: number;
  views: number;
  clicks: number;
  engagementScore: number;
}

interface SectionDurationChartProps {
  data: SectionDurationData[];
}

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  clicks: {
    label: "Clicks",
    color: "hsl(var(--chart-2))",
  },
  engagementScore: {
    label: "Engagement",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function SectionDurationChart({ data }: SectionDurationChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-2 border-[#3498DB]/10 shadow-lg">
        <CardHeader className="items-center pb-4">
          <CardTitle className="text-lg sm:text-xl text-[#2C3E50] dark:text-white">
            Section Retention Analysis
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Average time visitors spend in each section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            No section duration data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Take top 6 sections by engagement score
  const topSections = [...data]
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 6);

  // Normalize data to 0-100 scale for consistent visualization
  const maxViews = Math.max(...topSections.map(item => item.views), 1);
  const maxClicks = Math.max(...topSections.map(item => item.clicks), 1);
  const maxEngagement = Math.max(...topSections.map(item => item.engagementScore), 1);

  // Format section names and normalize values
  const chartData = topSections.map((item) => ({
    section: item.section.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    views: Math.round((item.views / maxViews) * 100),
    clicks: Math.round((item.clicks / maxClicks) * 100),
    engagementScore: Math.round((item.engagementScore / maxEngagement) * 100),
    // Keep original values for tooltip
    originalViews: item.views,
    originalClicks: item.clicks,
    originalEngagement: item.engagementScore.toFixed(1),
  }));

  // Calculate totals for footer
  const totalViews = topSections.reduce((sum, item) => sum + item.views, 0);
  const totalClicks = topSections.reduce((sum, item) => sum + item.clicks, 0);
  const avgEngagement = topSections.length > 0 
    ? topSections.reduce((sum, item) => sum + item.engagementScore, 0) / topSections.length 
    : 0;

  return (
    <Card className="border-2 border-[#3498DB]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="items-center pb-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#3498DB]/10 to-[#2C3E50]/10">
            <TrendingUp className="h-5 w-5 text-[#3498DB]" />
          </div>
          <div className="text-center sm:text-left">
            <CardTitle className="text-lg sm:text-xl text-[#2C3E50] dark:text-white">
              Section Retention Analysis
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-0.5">
              Engagement metrics across resume sections
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-0 px-2 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-auto h-[280px] sm:h-[320px]"
        >
          <RadarChart
            data={chartData}
            margin={{
              top: 20,
              bottom: 20,
              left: 50,
              right: 50,
            }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                indicator="line"
                formatter={(value, name, item) => {
                  // Show original values instead of normalized ones with proper spacing
                  if (name === 'views') {
                    return [item.payload.originalViews + ' ', 'Views'];
                  }
                  if (name === 'clicks') {
                    return [item.payload.originalClicks + ' ', 'Clicks'];
                  }
                  if (name === 'engagementScore') {
                    return [item.payload.originalEngagement + ' ', 'Engagement'];
                  }
                  return [value + ' ', name];
                }}
              />}
            />
            <PolarAngleAxis 
              dataKey="section"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 10 }}
              tickLine={false}
            />
            <PolarGrid 
              gridType="polygon"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              strokeOpacity={0.3}
            />
            <Radar
              dataKey="views"
              fill="var(--color-views)"
              fillOpacity={0.2}
              stroke="var(--color-views)"
              strokeWidth={2}
            />
            <Radar 
              dataKey="clicks" 
              fill="var(--color-clicks)" 
              fillOpacity={0.15}
              stroke="var(--color-clicks)"
              strokeWidth={2}
            />
            <Radar 
              dataKey="engagementScore" 
              fill="var(--color-engagementScore)" 
              fillOpacity={0.1}
              stroke="var(--color-engagementScore)"
              strokeWidth={2}
            />
            <ChartLegend 
              className="mt-6" 
              content={<ChartLegendContent />} 
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-3 pb-3 sm:pb-4">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-[var(--chart-1)]" />
            <span className="text-gray-600 dark:text-gray-400">
              {totalViews} total views
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MousePointerClick className="h-3.5 w-3.5 text-[var(--chart-2)]" />
            <span className="text-gray-600 dark:text-gray-400">
              {totalClicks} total clicks
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-[var(--chart-3)]" />
            <span className="text-gray-600 dark:text-gray-400">
              {avgEngagement.toFixed(1)} avg engagement
            </span>
          </div>
        </div>
        <div className="text-xs text-center text-muted-foreground">
          Top {chartData.length} sections by engagement score
        </div>
      </CardFooter>
    </Card>
  );
}
