"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration, formatDurationDetailed } from "@/utils/time-formatters";

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

const COLORS = [
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#6366f1", // Indigo
];

export function SectionDurationChart({ data }: SectionDurationChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Section Retention</CardTitle>
          <CardDescription>Average time visitors spend in each section</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No section duration data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by engagement score
  const sortedData = [...data].sort((a, b) => b.engagementScore - a.engagementScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Retention Analysis</CardTitle>
        <CardDescription>
          Time spent and engagement per section (higher is better)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="section" 
              stroke="hsl(var(--foreground))"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--foreground))"
              label={{ 
                value: 'Avg Duration', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: 'hsl(var(--foreground))' }
              }}
              tick={{ fill: 'hsl(var(--foreground))' }}
              tickFormatter={(value: number) => formatDuration(value)}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string) => {
                if (name === 'avgDuration') return [formatDurationDetailed(value), 'Avg Duration'];
                if (name === 'views') return [value, 'Views'];
                if (name === 'clicks') return [value, 'Clicks'];
                if (name === 'engagementScore') return [value.toFixed(1), 'Engagement'];
                return [value, name];
              }}
            />
            <Bar dataKey="avgDuration" radius={[8, 8, 0, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend with additional metrics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedData.slice(0, 6).map((section, index) => (
            <div
              key={section.section}
              className="flex items-start space-x-3 p-3 rounded-lg border bg-card"
            >
              <div
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm capitalize truncate">
                  {section.section.replace(/_/g, ' ')}
                </p>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>⏱️ {formatDuration(section.avgDuration)} avg</p>
                  <p>👁️ {section.views} views</p>
                  <p>👆 {section.clicks} clicks</p>
                  <p className="font-semibold text-foreground">
                    🎯 {section.engagementScore.toFixed(1)} engagement
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
