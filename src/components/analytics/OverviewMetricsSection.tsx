import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceMetric } from "./PerformanceMetric";
import { Eye, MousePointerClick, Clock, TrendingUp } from "lucide-react";
import type { AnalyticsCalculations } from "@/hooks/use-analytics-calculations";

interface OverviewMetricsSectionProps {
  calculations: AnalyticsCalculations;
  loading?: boolean;
}

export function OverviewMetricsSection({
  calculations,
  loading = false,
}: OverviewMetricsSectionProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-8 bg-muted rounded w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <PerformanceMetric
            label=""
            value={calculations.totalViews}
            change={calculations.viewsGrowthRate}
            format="number"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Interactions</CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <PerformanceMetric
            label=""
            value={calculations.totalInteractions}
            change={calculations.interactionsGrowthRate}
            format="number"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <PerformanceMetric
            label=""
            value={calculations.avgViewDuration}
            change={calculations.durationGrowthRate}
            format="duration"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <PerformanceMetric
            label=""
            value={calculations.avgEngagementRate * 100}
            format="percentage"
            showTrend={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
