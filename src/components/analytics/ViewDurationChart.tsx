import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ViewDurationChartProps {
  data: Array<{ range: string; count: number }>;
  title?: string;
}

export function ViewDurationChart({
  data,
  title = "View Duration Distribution",
}: ViewDurationChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No duration data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Color gradient from low to high engagement
  const getBarColor = (index: number, total: number) => {
    const colors = [
      "hsl(var(--chart-4))", // Light/low engagement
      "hsl(var(--chart-3))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-1))", // Strong/high engagement
    ];
    
    const colorIndex = Math.min(
      Math.floor((index / total) * colors.length),
      colors.length - 1
    );
    return colors[colorIndex];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="range"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(index, data.length)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
