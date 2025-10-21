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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
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
                const category = props.payload?.category || '';
                return [`${value} views`, `${category}`];
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
