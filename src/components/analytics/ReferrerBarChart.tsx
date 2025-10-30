import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Share2 } from "lucide-react";

interface ReferrerBarChartProps {
  data: Array<{ name: string; count: number }>;
  title?: string;
  maxItems?: number;
}

// Helper to format referrer names
const formatReferrerName = (referrer: string): string => {
  // Handle UTM source format
  if (referrer.startsWith('utm_source:')) {
    const source = referrer.replace('utm_source:', '');
    return `🔗 ${source}`;
  }
  
  // Handle ref parameter format
  if (referrer.startsWith('ref:')) {
    const ref = referrer.replace('ref:', '');
    return `🔖 ${ref}`;
  }
  
  // Handle internal navigation
  if (referrer.startsWith('internal:')) {
    const path = referrer.replace('internal:', '');
    return `🏠 ${path}`;
  }
  
  // Direct access
  if (referrer === 'direct') {
    return '🌐 Direct';
  }
  
  // External URL - try to extract domain
  try {
    const url = new URL(referrer);
    return `🌍 ${url.hostname}`;
  } catch {
    // If not a valid URL, truncate if too long
    return referrer.length > 30 ? referrer.substring(0, 30) + "..." : referrer;
  }
};

// Helper to categorize referrers
const categorizeReferrer = (referrer: string): string => {
  if (referrer === 'direct') return 'Direct';
  if (referrer.startsWith('utm_source:')) return 'Campaign';
  if (referrer.startsWith('ref:')) return 'Referral';
  if (referrer.startsWith('internal:')) return 'Internal';
  return 'External';
};

export function ReferrerBarChart({
  data,
  title = "Top Referrers",
  maxItems = 10,
}: ReferrerBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-2 border-[#3498DB]/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-[#2C3E50] dark:text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No referrer data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Take top N items and sort by count
  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, maxItems)
    .map((item) => ({
      name: formatReferrerName(item.name),
      originalName: item.name,
      category: categorizeReferrer(item.name),
      value: item.count,
    }));

  const totalViews = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-2 border-[#3498DB]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#3498DB]/10 to-[#2C3E50]/10">
            <Share2 className="h-5 w-5 text-[#3498DB]" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl text-[#2C3E50] dark:text-white">{title}</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-0.5">
              Total: {totalViews} views from top sources
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-6 sm:pb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              width={150}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={(value: number, name: string, props: { payload?: { category?: string } }) => {
                const category = props.payload?.category || 'Views';
                return [value, category];
              }}
              labelFormatter={(label: string) => {
                const item = chartData.find(d => d.name === label);
                return item?.originalName || label;
              }}
            />
            <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
